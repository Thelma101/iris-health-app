import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Lunar Med-Track</h1>
        <p className="mt-4 text-base sm:text-lg text-foreground/70">
          Your personal medication tracking companion
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link
            className="rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 text-center font-medium"
            href="/login"
          >
            Go to Login
          </Link>
          <Link
            className="rounded-md border border-[var(--border)] px-4 py-2 text-center font-medium"
            href="/dashboard"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}