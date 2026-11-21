import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RhythmX — NOIR//SOUND 3D Lossless Streaming',
  description: 'Spatial 3D audiophile music streaming engine powered by Singh Music Co.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="no-referrer" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#080809] text-[#f4f0f2] antialiased overflow-x-hidden selection:bg-[#FF2348] selection:text-white">
        {children}
      </body>
    </html>
  );
}
