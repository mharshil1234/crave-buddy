import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { LocationProvider } from "@/components/LocationProvider";
import { Toaster } from "sonner";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crave Buddy",
  description:
    "Crave Buddy suggests food that matches your mood. Describe a craving, build a mood board, or vote on dinner with friends in a Mood Room.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <LocationProvider />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
