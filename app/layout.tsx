import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Sheela Bhaskaran · OneSite4U",
  description:
    "CEO, Octogon Mitra Investments. Book a consultation, explore services, RSVP to events and stay connected — all from one link.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4f46e5",
};

const themeScript = `try{var t=localStorage.getItem('os4u-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Poppins:wght@500;600;700&family=Sora:wght@500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONT_HREF} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
