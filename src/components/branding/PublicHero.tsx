"use client";

import Image from "next/image";

type PublicHeroProps = {
  subtitle?: string;
};

export function PublicHero({
  subtitle = "Platform for Tracking Public Tenders",
}: PublicHeroProps) {
  return (
    <div className="text-center">
      <Image
        src="/jyadlogo.png"
        alt="Jyad"
        width={320}
        height={110}
        priority
        className="mx-auto h-auto w-full max-w-[280px] sm:max-w-[340px]"
      />
      <p
        className="mt-4 text-sm sm:text-base"
        style={{ color: "var(--text-secondary)" }}
      >
        {subtitle}
      </p>
    </div>
  );
}
