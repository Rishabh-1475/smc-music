import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#030303",
};

export const metadata: Metadata = {
  title: "SMC Singhs Music Co - YouTube Music Experience",
  description: "High Fidelity Lossless Streaming powered by SMC Singhs Music Co",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SMC Music",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-[#030303]">
      <body className="bg-[#030303] text-white antialiased selection:bg-emerald-500 selection:text-black min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
