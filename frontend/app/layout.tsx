import React from "react"
import type { Metadata } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const dmSans = DM_Sans({ subsets: ["latin"], variable: '--font-dm-sans', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'SanctionX - AI-Powered Digital Loan Officer | Instant Personal Loan Eligibility',
  description: 'Get your personal loan sanctioned in 5 minutes with AI-guided eligibility check, Aadhaar eKYC, document OCR & instant sanction letter. 100% secure & RBI-aligned.',
  keywords: 'AI loan assistant India, instant loan chatbot, digital lending RBI, personal loan eligibility',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
