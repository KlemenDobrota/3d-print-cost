import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ServiceWorkerRegistration } from "@/components/ui/ServiceWorkerRegistration";
import { BottomNav } from "@/components/ui/BottomNav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "3D Print Cost",
  description: "Calculate true 3D printing costs and manage profit margins",
  applicationName: "3D Print Cost",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "3D Print Cost",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  // maximumScale and userScalable intentionally omitted — disabling zoom
  // violates WCAG 1.4.4 and is unnecessary for a well-designed touch UI.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-slate-900 text-slate-50 antialiased font-sans" suppressHydrationWarning>
        <ServiceWorkerRegistration />
        {children}
        <BottomNav />
        <Analytics />
      </body>
    </html>
  );
}
