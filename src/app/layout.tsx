import type { Metadata } from 'next';
import './globals.css';
import { Poppins } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import Image from 'next/image';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '700'] });
export const metadata: Metadata = {
  title:
    'Chefkoch.de Rezepte als Schritt für Schritt Anleitung | kochschritt.de',
  description:
    'Eine einfache Schritt für Schritt Anleitung für jedes Chefkoch.de Rezept',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <div className="flex flex-col h-screen overflow-hidden">
          <nav className="h-12 gap-2 flex-shrink-0 flex items-center px-6 bg-primary">
            <Image
              width={25}
              height={25}
              src="/favicon.svg"
              alt="kochschritt.de"
            />
            <span className="text-lg font-bold text-white">kochschritt.de</span>
          </nav>
          <div className="overflow-auto grow">{children}</div>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
