import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Green City | Smart Waste Collection & Management System",
  description: "Badulla Municipal Council's premium Smart City platform. Transforming traditional waste management into a sustainable, GPS-tracked, real-time collection system.",
  keywords: [
    "Smart Waste Management",
    "Green City",
    "Waste Collection Tracking",
    "Eco-friendly Dashboard",
    "Recycling Tracker",
    "Badulla Municipal Council"
  ],
  authors: [{ name: "Badulla Municipal Council IT Division" }],
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full scroll-smooth">
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-primary-green selection:text-white">
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" richColors theme="light" closeButton />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
