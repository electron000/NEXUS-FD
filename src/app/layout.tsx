import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus Digital Asset Terminal",
  description:
    "Command your digital assets with precision. Real-time valuation and portfolio auditing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body>{children}</body>
    </html>
  );
}
