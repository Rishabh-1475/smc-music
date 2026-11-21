import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RhythmX 3D Lossless Streaming',
  description: 'Spatial 3D audiophile music streaming powered by Singh Music Co.',
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
      </head>
      <body className="bg-[#030305] text-white antialiased selection:bg-[#EF4444] selection:text-white">
        {children}
      </body>
    </html>
  );
}
