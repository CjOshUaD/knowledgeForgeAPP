import { NextUIProvider } from "@nextui-org/react";
import SessionProvider from "./Providers";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getServerSession } from "next-auth";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Knowledge Forge",
  description: "Generated by create next app",
  viewport: {
    initialScale: 1,
    width: "device-width",
    height: "device-height",
    maximumScale: 1,
    viewportFit: "cover",
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <SessionProvider session={session}>
            <NextUIProvider>
              {children}
            </NextUIProvider>
          </SessionProvider>
      </body>
      

    </html>
  );
}
