import type { Metadata } from "next";
import "./globals.css";

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
        {/* Load Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anuphan:wght@100..700&family=IBM+Plex+Sans+Thai:wght@100;200;300;400;500;600;700&family=Mitr:wght@200;300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-anuphan bg-emerald-50 text-gray-800">
        {children}
      </body>
    </html>
  );
}
