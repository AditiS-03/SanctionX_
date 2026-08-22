"use client";

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Shield, ArrowLeft, Calculator, X, User, Loader2 } from 'lucide-react'
import axios from 'axios'

const BACKEND_URL = "http://localhost:8005";

const interestRates = [
  { loanAmount: '₹50,000', tenure: '12 months', rate: '10.99%', emi: '₹4,432' },
  { loanAmount: '₹1,00,000', tenure: '24 months', rate: '11.49%', emi: '₹4,703' },
  { loanAmount: '₹2,50,000', tenure: '36 months', rate: '12.99%', emi: '₹8,439' },
  { loanAmount: '₹5,00,000', tenure: '48 months', rate: '13.99%', emi: '₹14,545' },
  { loanAmount: '₹10,00,000', tenure: '60 months', rate: '14.99%', emi: '₹23,791' },
  { loanAmount: '₹50,00,000', tenure: '60 months', rate: '15.99%', emi: '₹1,19,146' },
]

const tenureOptions = [
  { value: '12', label: '12 months' },
  { value: '24', label: '24 months' },
  { value: '36', label: '36 months' },
  { value: '48', label: '48 months' },
  { value: '60', label: '60 months' },
]

export default function InterestRatesPage() {
  const [loanAmount, setLoanAmount] = useState('300000')
  const [tenure, setTenure] = useState('36')
  const [rate, setRate] = useState('12.99')
  const [emiData, setEmiData] = useState({ emi: 0, totalPayable: 0, interest: 0 })
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    const calculateEMI = async () => {
      setCalculating(true)
      try {
        const res = await axios.post(`${BACKEND_URL}/emi-calc`, {
          amount: parseFloat(loanAmount),
          tenure: parseInt(tenure),
          rate: parseFloat(rate)
        })
        const emi = res.data.emi
        const principal = parseFloat(loanAmount)
        const total = emi * parseInt(tenure)
        setEmiData({
          emi: emi,
          totalPayable: total,
          interest: total - principal
        })
      } catch (e) {
        console.error("EMI calculation failed")
      } finally {
        setCalculating(false)
      }
    }
    const timer = setTimeout(calculateEMI, 500)
    return () => clearTimeout(timer)
  }, [loanAmount, tenure, rate])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/50 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground font-[family-name:var(--font-heading)]">
              SanctionX
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Interest Rates Table */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground font-[family-name:var(--font-heading)]">
                Interest Rates & EMI Calculator
              </h1>
              <p className="text-muted-foreground mt-2">
                Current indicative rates — final offer depends on your eligibility & profile.
              </p>
            </div>
            <button className="text-muted-foreground hover:text-foreground p-2">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <Card className="border-border/50 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/5">
                    <TableHead className="text-primary font-semibold py-4">LOAN AMOUNT</TableHead>
                    <TableHead className="text-primary font-semibold py-4">TENURE</TableHead>
                    <TableHead className="text-primary font-semibold py-4">RATE (P.A.)</TableHead>
                    <TableHead className="text-primary font-semibold py-4 text-right">EST. EMI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interestRates.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="font-medium py-5">{row.loanAmount}</TableCell>
                      <TableCell className="py-5">{row.tenure}</TableCell>
                      <TableCell className="text-primary font-medium py-5">{row.rate}</TableCell>
                      <TableCell className="text-right font-semibold text-primary py-5">{row.emi}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </section>

        {/* EMI Calculator */}
        <section>
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-[family-name:var(--font-heading)]">
                <Calculator className="h-5 w-5 text-primary" />
                EMI Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount" className="text-sm font-medium">
                    Loan Amount (₹)
                  </Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="h-12 text-lg font-medium"
                    placeholder="300000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenure" className="text-sm font-medium">
                    Tenure
                  </Label>
                  <Select value={tenure} onValueChange={setTenure}>
                    <SelectTrigger className="h-12 text-lg font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tenureOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate" className="text-sm font-medium">
                    Rate (% p.a.)
                  </Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="h-12 text-lg font-medium"
                    placeholder="12.99"
                  />
                </div>
              </div>

              {/* EMI Result */}
              <div className="bg-primary/5 rounded-2xl p-8 text-center">
                <p className="text-primary font-semibold mb-2">Your Estimated Monthly EMI</p>
                <p className="text-5xl md:text-6xl font-bold text-primary font-[family-name:var(--font-heading)] mb-4">
                  {formatCurrency(emiData.emi)}
                </p>
                <p className="text-muted-foreground">
                  Total payable: <span className="font-medium text-foreground">{formatCurrency(emiData.totalPayable)}</span>
                  {' | '}
                  Interest: <span className="font-medium text-foreground">{formatCurrency(emiData.interest)}</span>
                </p>
              </div>

              <div className="mt-8 text-center">
                <Link href="/auth">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 rounded-xl px-8 h-12 font-semibold"
                  >
                    Apply Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-8 max-w-2xl mx-auto">
          The above EMI calculator is for illustration purposes only. Actual EMI may vary based on your credit profile, 
          loan amount, tenure, and prevailing interest rates. Final rates will be communicated at the time of loan sanction.
        </p>
      </div>
    </main>
  )
}
