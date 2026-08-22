'use client';

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, CheckCircle, ArrowRight, Calculator } from 'lucide-react'

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        setMousePosition({ x, y })
      }
    }

    const section = sectionRef.current
    if (section) {
      section.addEventListener('mousemove', handleMouseMove)
      return () => section.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="relative bg-gradient-to-b from-background to-muted/30 pt-24 pb-20 px-4 md:pt-32 md:pb-28 overflow-hidden"
    >
      {/* Animated cursor-following backdrop */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main gradient blob */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 transition-transform duration-300 ease-out"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(34, 197, 94, 0.3))',
            left: `calc(${mousePosition.x * 100}% - 300px)`,
            top: `calc(${mousePosition.y * 100}% - 300px)`,
          }}
        />
        {/* Secondary blob */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 transition-transform duration-500 ease-out"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(59, 130, 246, 0.3))',
            right: `calc(${(1 - mousePosition.x) * 100}% - 200px)`,
            bottom: `calc(${(1 - mousePosition.y) * 100}% - 200px)`,
          }}
        />
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary/30 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-accent/20 animate-pulse delay-300" />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-primary/20 animate-pulse delay-500" />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 rounded-full bg-accent/30 animate-pulse delay-700" />
      </div>
      
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 border border-primary/20 backdrop-blur-sm">
          <Shield className="h-4 w-4" />
          <span>RBI-aligned Digital Lending</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.1] mb-6 text-balance font-[family-name:var(--font-heading)]">
          Personal Loan Sanctioned in{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            30 Minutes
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty leading-relaxed">
          AI-guided eligibility check, Aadhaar eKYC, document OCR & instant sanction letter. 
          No branch visits. No phone calls.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/auth">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 text-base px-8 py-6 h-auto font-semibold shadow-xl shadow-primary/20 rounded-xl w-full sm:w-auto"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/interest-rates">
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 h-auto font-medium rounded-xl w-full sm:w-auto bg-transparent backdrop-blur-sm"
            >
              <Calculator className="mr-2 h-5 w-5" />
              EMI Calculator
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm">
          {[
            'No Paperwork',
            'Instant Decision',
            'Bank-grade Security',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-accent" />
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
