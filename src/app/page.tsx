import Link from "next/link";
import { PublicHero } from "@/components/branding/PublicHero";

export default function Home() {
  return (
    <main
      className="min-h-screen px-4 py-6 sm:px-6 sm:py-8"
      style={{ background: "var(--background)" }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <section
          className="relative isolate w-full overflow-hidden rounded-[2rem] border px-6 py-10 sm:px-10 sm:py-14"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-15"
            style={{
              backgroundImage: "url('/jyad_background.svg')",
              backgroundPosition: "center -4px",
              backgroundSize: "cover",
              transform: "scale(1.03)",
              transformOrigin: "center",
            }}
          />
          <div
            className="absolute inset-0 -z-10 rounded-[2rem] opacity-60 blur-3xl"
            style={{
              background:
                "radial-gradient(circle at top, rgba(0, 90, 97, 0.14), transparent 55%)",
            }}
          />
          <div className="mx-auto max-w-3xl text-center">
            <PublicHero />
            <div className="mt-10 space-y-4">
              <p
                className="text-xl font-semibold leading-tight sm:text-3xl"
                style={{ color: "var(--text-primary)" }}
              >
                The goal is to help SMEs discover tenders, understand
                competition, and make better bidding decisions.
              </p>
              <p
                className="mx-auto max-w-2xl text-sm leading-7 sm:text-base"
                style={{ color: "var(--text-secondary)" }}
              >
                The goal of this task is to test your ability to build products
                with the leverage of AI.
              </p>
            </div>
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/login"
              className="rounded-lg px-7 py-3 text-sm font-medium transition-all"
              style={{ background: "var(--accent)", color: "white" }}
            >
              Continue to sign in
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
