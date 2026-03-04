import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zycus Horizon EU & UK 2026 — Feedback",
  description: "Share your experience at Zycus Horizon EU & UK Edition 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
