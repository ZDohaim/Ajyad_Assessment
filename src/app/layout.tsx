import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TenderTrack — Procurement Intelligence",
  description: "Discover tenders, analyze competitors, and win more bids.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
