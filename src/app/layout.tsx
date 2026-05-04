import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "Nexus Digital Asset Terminal",
  description:
    "Command your digital assets with precision. Real-time valuation and portfolio auditing.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className="antialiased">
        {children}
        <Toaster theme="dark" position="bottom-right" closeButton />
      </body>

    </html>
  );
}
