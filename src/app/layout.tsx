import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/shared/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LUXE FASHION - Toko Fashion Online Terlengkap",
  description:
    "Belanja fashion terbaru dengan harga terbaik. Koleksi pria, wanita, anak, hijab, sepatu, tas, dan aksesoris premium. Promo menarik setiap hari!",
  keywords: [
    "fashion online",
    "toko baju online",
    "belanja fashion",
    "pakaian wanita",
    "pakaian pria",
    "hijab",
    "sepatu online",
    "tas branded",
    "aksesoris fashion",
    "LUXE FASHION",
  ],
  authors: [{ name: "LUXE FASHION" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "LUXE FASHION - Toko Fashion Online Terlengkap",
    description:
      "Belanja fashion terbaru dengan harga terbaik. Koleksi lengkap pria, wanita, dan anak.",
    type: "website",
    siteName: "LUXE FASHION",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUXE FASHION - Toko Fashion Online",
    description: "Belanja fashion terbaru dengan harga terbaik.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
