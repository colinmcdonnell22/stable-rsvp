import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { GuestProvider } from "@/contexts/GuestContext";

export const metadata: Metadata = {
  title: "STABLE RSVP",
  description: "RSVP for STABLE dinner events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GuestProvider>
          <AppShell>{children}</AppShell>
        </GuestProvider>
      </body>
    </html>
  );
}
