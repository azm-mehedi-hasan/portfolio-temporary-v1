"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitContact, type ContactState } from "@/lib/actions/contact";

const initial: ContactState = { status: "idle" };

const fieldClass =
  "bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-200 px-2 py-2 rounded-md text-sm text-neutral-700 w-full";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center px-2 py-2 mt-4 bg-neutral-100 rounded-md font-bold text-neutral-500 disabled:opacity-70"
    >
      {pending ? (
        <>
          <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin mr-2" />
          Sending...
        </>
      ) : (
        "Send Message"
      )}
    </button>
  );
}

export const Contact = () => {
  const [state, formAction] = useFormState(submitContact, initial);

  return (
    <form action={formAction} className="form">
      <div className="flex flex-col md:flex-row justify-between gap-5">
        <div className="w-full">
          <label htmlFor="contact-name" className="sr-only">
            Your name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            placeholder="Your Name"
            required
            className={fieldClass}
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name}</p>
          )}
        </div>

        <div className="w-full">
          <label htmlFor="contact-email" className="sr-only">
            Your email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="Your email address"
            required
            className={fieldClass}
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="sr-only">
          Your message
        </label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="Your Message"
          required
          rows={10}
          className={`${fieldClass} mt-4`}
        />
        {state.fieldErrors?.message && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.message}</p>
        )}
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status !== "idle" && state.message && (
        <p
          role="status"
          data-testid="contact-status"
          className={
            state.status === "success"
              ? "mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-emerald-200"
              : "mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200"
          }
        >
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
};
