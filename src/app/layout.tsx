import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MarkItDown - Free AI PDF to Markdown Converter",
  description: "Convert PDFs and images to clean Markdown instantly using local, completely private AI OCR. Zero server uploads, 100% free, runs offline.",
  keywords: ["PDF to Markdown", "Image to Markdown", "Free OCR", "Local AI OCR", "Private PDF converter", "Tesseract.js OCR", "Next.js Markdown", "Image Text Extraction"],
  authors: [{ name: "MarkItDown" }],
  openGraph: {
    title: "MarkItDown - Private AI PDF to Markdown",
    description: "Convert PDFs into Markdown directly in your browser. 100% free, no data leaves your device.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MarkItDown - Free AI PDF to Markdown Converter",
    description: "Lightning-fast, local-first OCR engine.",
  },
  manifest: "/manifest.json",
  themeColor: "#9333ea",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MarkItDown",
  "description": "Convert PDFs and images to Markdown directly in your browser using local OCR.",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}