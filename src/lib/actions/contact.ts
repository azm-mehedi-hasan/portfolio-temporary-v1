"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { adminAction } from "@/lib/actions/helpers";
import { prisma } from "@/lib/prisma";
import { clientIpHash, rateLimit } from "@/lib/rate-limit";
import { ContactSchema } from "@/lib/validation";
import { z } from "zod";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Public contact form.
 *
 * Replaces the previous client-side EmailJS call, which shipped the service id,
 * template id and public key to every visitor. Nothing secret reaches the
 * browser now, and every message is persisted even if delivery fails.
 */
export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = ContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: parsed.error.issues[0].message,
      fieldErrors,
    };
  }

  const { name, email, message, website } = parsed.data;

  // Honeypot: a real person never fills a hidden field. Report success so bots
  // get no signal about why nothing happened.
  if (website) return { status: "success", message: "Thanks — your message is on its way." };

  const ipHash = clientIpHash();
  const limit = await rateLimit(`contact:${ipHash}`, 5, 3600);
  if (!limit.ok) {
    return {
      status: "error",
      message: "You've sent several messages already. Please try again later.",
    };
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
        ipHash,
        userAgent: headers().get("user-agent")?.slice(0, 300) ?? null,
      },
    });
  } catch (error) {
    console.error("[contact] could not save message", error);
    return {
      status: "error",
      message: "Something went wrong saving your message. Please try again.",
    };
  }

  // Delivery is best-effort: the message is already stored and visible in the
  // admin inbox, so an email outage must not look like a failure to the sender.
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (apiKey && to) {
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to,
        replyTo: email,
        subject: `Portfolio message from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      });
    } catch (error) {
      console.error("[contact] email delivery failed", error);
    }
  }

  return {
    status: "success",
    message: "Thanks — your message is on its way. I'll get back to you soon.",
  };
}

// ─────────────────────────────────────────────────────────── admin side

export const markMessageRead = adminAction({
  schema: z.object({ id: z.string().min(1), isRead: z.boolean() }),
  entity: "message",
  action: "update",
  handler: async ({ id, isRead }) =>
    prisma.contactMessage.update({ where: { id }, data: { isRead } }),
});

export const archiveMessage = adminAction({
  schema: z.object({ id: z.string().min(1), isArchived: z.boolean() }),
  entity: "message",
  action: "archive",
  successMessage: "Updated",
  handler: async ({ id, isArchived }) =>
    prisma.contactMessage.update({
      where: { id },
      data: { isArchived, isRead: true },
    }),
});

export const deleteMessage = adminAction({
  schema: z.object({ id: z.string().min(1) }),
  entity: "message",
  action: "delete",
  successMessage: "Message deleted",
  handler: async ({ id }) => {
    await prisma.contactMessage.delete({ where: { id } });
  },
});
