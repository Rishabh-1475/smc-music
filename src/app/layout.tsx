import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0A0A0C",
};

export const metadata: Metadata = {
  title: "RhythmX - Mobile Music Experience",
  description: "Next-Gen 3D Mobile Music Player & Discovery Engine",
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
    <html lang="en" className="dark bg-[#050505]">
      <body className="bg-[#050505] text-[#F0F0F2] antialiased min-h-screen font-sans overflow-x-hidden selection:bg-[#D4FF00] selection:text-black">
        {/* Strictly Centered Mobile Viewport Frame on Desktop */}
        <div className="w-full min-h-screen bg-[#050505] flex justify-center items-start">
          <div className="w-full md:max-w-[430px] min-h-screen bg-[#0A0A0C] md:border-x md:border-white/10 md:shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col overflow-x-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
