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
      <div className="mx-auto w-full max-w-[280px] overflow-hidden sm:max-w-[340px]">
        <Image
          src="/jyadlogo.png"
          alt="Jyad"
          width={320}
          height={110}
          priority
          className="-mt-[4px] mx-auto h-auto w-full"
        />
      </div>
      <p
        className="mt-4 text-sm sm:text-base"
        style={{ color: "var(--text-secondary)" }}
      >
        {subtitle}
      </p>
    </div>
  );
}
