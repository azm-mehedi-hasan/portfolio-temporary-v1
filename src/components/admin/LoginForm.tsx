"use client";

import { useFormState } from "react-dom";
import { login, type LoginState } from "@/lib/actions/auth";
import { Card, Field, Input, SubmitButton } from "./ui";

const initial: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState(login, initial);

  return (
    <Card className="p-6">
      <form action={formAction} className="flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}

        <Field label="Email">
          <Input
            name="email"
            type="email"
            autoComplete="username"
            required
            autoFocus
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password">
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
        </Field>

        {state.error && (
          <p
            role="alert"
            data-testid="login-error"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200"
          >
            {state.error}
          </p>
        )}

        <SubmitButton pendingText="Signing in..." className="w-full">
          Sign in
        </SubmitButton>
      </form>
    </Card>
  );
}
