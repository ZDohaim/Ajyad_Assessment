import Link from "next/link";
import { PublicHero } from "@/components/branding/PublicHero";

export default function Home() {
  return (
    <main
      className="min-h-screen px-4 py-12 sm:px-6"
      style={{ background: "var(--background)" }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">
        <div className="relative isolate w-full max-w-3xl rounded-[2rem] border px-6 py-12 text-center sm:px-10 sm:py-16">
          <div
            className="absolute inset-0 -z-10 rounded-[2rem] opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(circle at top, rgba(0, 196, 180, 0.16), transparent 55%)",
            }}
          />
          <PublicHero />
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-lg px-6 py-3 text-sm font-medium transition-all"
              style={{ background: "var(--accent)", color: "white" }}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg border px-6 py-3 text-sm font-medium transition-all"
              style={{
                borderColor: "var(--border-strong)",
                color: "var(--text-primary)",
                background: "var(--surface)",
              }}
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
