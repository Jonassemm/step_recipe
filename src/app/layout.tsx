import type { Metadata } from 'next';
import './globals.css';
import { Poppins } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '700'] });
export const metadata: Metadata = {
  title: 'Step Recipe',
  description: 'A recipe app for the modern web',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
