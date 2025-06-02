import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Market Probe | Validate Your Product Idea",
  description: "Sign up to get early access to our upcoming product",
  openGraph: {
    title: "Market Probe | Validate Your Product Idea",
    description: "Sign up to get early access to our upcoming product",
    url: "https://yourproductdomain.com",
    siteName: "Market Probe",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Market Probe",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Market Probe | Validate Your Product Idea",
    description: "Sign up to get early access to our upcoming product",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Plausible Analytics Script - Only add in production */}
          {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
            <script
              defer
              data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
              src="https://plausible.io/js/script.js"
            />
          )}
        </head>
        <body className={inter.className}>
          <div className="flex min-h-screen flex-col">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
