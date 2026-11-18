import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "RhythmX - Next-Gen 3D Music Experience",
  description: "Lossless 320kbps Audio Streaming & Visual Soundscapes by RhythmX",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RhythmX",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-[#000000]">
      <body className="bg-[#000000] text-white antialiased selection:bg-[#00FF87] selection:text-black min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
