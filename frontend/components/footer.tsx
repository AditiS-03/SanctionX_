import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, User } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-[family-name:var(--font-heading)]">SanctionX</span>
          </Link>

          <Link href="/login">
            <Button
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 rounded-xl px-6"
            >
              <User className="mr-2 h-4 w-4" />
              Login / Sign Up
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm mb-10">
          <a
            href="#"
            className="text-background/70 hover:text-background transition-colors font-medium"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-background/70 hover:text-background transition-colors font-medium"
          >
            Terms & Conditions
          </a>
          <Link
            href="/interest-rates"
            className="text-background/70 hover:text-background transition-colors font-medium"
          >
            Interest Rates
          </Link>
          <a
            href="#"
            className="text-background/70 hover:text-background transition-colors font-medium"
          >
            RBI Guidelines
          </a>
        </div>

        <div className="border-t border-background/10 pt-8">
          <p className="text-center text-sm text-background/50 max-w-2xl mx-auto leading-relaxed">
            SanctionX does not store Aadhaar or PAN numbers. All verification is
            session-based. An AI-powered Digital Loan Officer
            built with RBI-first compliance.
          </p>
        </div>

        <div className="text-center text-xs text-background/30 mt-8">
          Interest rates: 8.99% - 15.99% p.a. | Loan amounts: Rs.50,000 - Rs.50,00,000 |
          Tenure: 12-60 months
        </div>
      </div>
    </footer>
  )
}
