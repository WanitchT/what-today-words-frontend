import type { Metadata } from "next";
import "./globals.css";
import HamburgerMenu from "@/components/HamburgerMenu"; 
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'วันนี้ลูกพูดอะไร',
  description: 'Track your baby’s first words!',
};

// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/baby-42-128.png" type="image/png" />

        {/* Mobile home screen icons */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
  
        {/* Load Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anuphan:wght@100..700&family=IBM+Plex+Sans+Thai:wght@100;200;300;400;500;600;700&family=Mitr:wght@200;300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-anuphan bg-emerald-50 text-gray-800">
        <HamburgerMenu /> {/* ✅ Global menu */}
        <main className="pt-12 bg-emerald-50">{children}</main>
        <Footer />

      </body>
    </html>
  );
}
