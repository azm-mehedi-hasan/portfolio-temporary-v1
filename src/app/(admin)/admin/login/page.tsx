import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Sign in | Admin" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">Sign in</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage the content of your portfolio.
          </p>
        </div>
        <LoginForm next={searchParams.next} />
      </div>
    </main>
  );
}
