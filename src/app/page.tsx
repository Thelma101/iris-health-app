import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold">Lunar Med-Track</h1>
      <p className="mt-4 text-lg text-foreground/70">
        Your personal medication tracking companion
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          className="rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2"
          href="/login"
        >
          Go to Login
        </Link>
        <Link
          className="rounded-md border border-[var(--border)] px-4 py-2"
          href="/dashboard"
        >
          View Dashboard
        </Link>
      </div>
    </main>
  );
}
