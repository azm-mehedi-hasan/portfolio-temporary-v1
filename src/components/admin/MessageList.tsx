"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  archiveMessage,
  deleteMessage,
  markMessageRead,
} from "@/lib/actions/contact";
import { Button, Card, EmptyState } from "./ui";

export type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
};

export function MessageList({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);

  async function open(m: Message) {
    const next = openId === m.id ? null : m.id;
    setOpenId(next);
    if (next && !m.isRead) {
      await markMessageRead({ id: m.id, isRead: true });
      router.refresh();
    }
  }

  async function archive(m: Message) {
    const result = await archiveMessage({ id: m.id, isArchived: !m.isArchived });
    if (result.ok) {
      toast.success(m.isArchived ? "Moved back to inbox" : "Archived");
      router.refresh();
    } else toast.error(result.error);
  }

  async function remove(m: Message) {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    const result = await deleteMessage({ id: m.id });
    if (result.ok) {
      toast.success("Message deleted");
      router.refresh();
    } else toast.error(result.error);
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        title="No messages"
        description="Messages sent through the contact form land here, and are emailed to you as well."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {messages.map((m) => (
        <Card key={m.id} data-testid="message-row">
          <div className="p-3">
            <button
              onClick={() => open(m)}
              className="flex w-full items-center gap-3 text-left"
            >
              {!m.isRead && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm ${
                    m.isRead ? "text-neutral-700" : "font-semibold text-neutral-900"
                  }`}
                >
                  {m.name}{" "}
                  <span className="font-normal text-neutral-400">{m.email}</span>
                </p>
                <p className="truncate text-xs text-neutral-500">{m.message}</p>
              </div>
              <span className="shrink-0 text-[11px] tabular-nums text-neutral-400">
                {m.createdAt}
              </span>
            </button>

            {openId === m.id && (
              <div className="mt-3 border-t border-neutral-100 pt-3">
                <p className="whitespace-pre-wrap text-sm text-neutral-700">
                  {m.message}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(
                      "Re: your message"
                    )}`}
                  >
                    <Button size="sm">Reply by email</Button>
                  </a>
                  <Button size="sm" variant="secondary" onClick={() => archive(m)}>
                    {m.isArchived ? "Move to inbox" : "Archive"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(m)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
