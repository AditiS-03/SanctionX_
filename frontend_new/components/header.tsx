'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, userProfile } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b border-border/50 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground font-[family-name:var(--font-heading)]">
            SanctionX
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/interest-rates"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Interest Rates
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden border border-primary/20">
                  {userProfile?.profile_photo_url ? (
                    <img src={userProfile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold">{userProfile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  {userProfile?.full_name || 'My Profile'}
                </span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                <LogOut size={16} />
              </Button>
            </div>
          ) : (
            <>
              <Link href="/auth">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 rounded-lg px-5 shadow-sm"
                >
                  <User className="mr-1.5 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border px-4 py-5">
          <nav className="flex flex-col gap-4">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <Link
              href="/interest-rates"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Interest Rates
            </Link>
            {user ? (
               <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-start gap-2">
                    <User size={16} /> Profile
                  </Button>
               </Link>
            ) : (
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 w-full rounded-lg mt-2"
                >
                  <User className="mr-1.5 h-4 w-4" />
                  Login / Sign Up
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
