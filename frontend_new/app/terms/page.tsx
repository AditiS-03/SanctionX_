"use client";

import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Shield } from 'lucide-react';

export default function TermsPage() {
    return (
        <main className="min-h-screen">
            <Header />
            <div className="pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Shield className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">Terms & Conditions</h1>
                    </div>
                    
                    <div className="prose prose-slate max-w-none space-y-8">
                        <div>
                            <h2 className="text-xl font-bold mb-4 text-primary">1. Nature of Service</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                SanctionX operates as a Lending Service Provider (LSP) and does not directly lend or disburse loans. All loans are issued by RBI-regulated Banks or NBFCs.
                            </p>
                            <div className="mt-4 space-y-2">
                                <p className="font-semibold text-foreground">SanctionX provides:</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-4">
                                    <li>Digital onboarding</li>
                                    <li>KYC processing</li>
                                    <li>Eligibility assessment</li>
                                    <li>Fraud detection</li>
                                    <li>Documentation handling</li>
                                    <li>Loan application routing</li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-4 text-primary">2. No Direct Lending</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                SanctionX:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-4">
                                <li>Is not a Bank</li>
                                <li>Is not an NBFC</li>
                                <li>Does not hold borrower funds</li>
                                <li>Does not disburse loans directly</li>
                            </ul>
                            <p className="mt-4 text-muted-foreground">
                                Loan approval and disbursement decisions are made solely by the partner regulated entity.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-4 text-primary">3. KYC & Verification</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                By using this platform, users agree to:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-4">
                                <li>Aadhaar eKYC verification</li>
                                <li>PAN verification</li>
                                <li>Document processing via OCR</li>
                                <li>Fraud and risk checks</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-4 text-primary">4. Key Fact Statement (KFS)</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Before final loan approval, a Key Fact Statement (KFS) will be presented including:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-4 grid grid-cols-1 md:grid-cols-2">
                                <li>• Loan amount</li>
                                <li>• Interest rate</li>
                                <li>• EMI</li>
                                <li>• Total repayment amount</li>
                                <li>• Fees</li>
                                <li>• Foreclosure rules</li>
                            </ul>
                            <p className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20 text-sm font-medium">
                                User consent is mandatory before proceeding.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-4 text-primary">5. Data Accuracy</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Users must provide accurate information. False, misleading, or mismatched information may result in:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-4">
                                <li>Application rejection</li>
                                <li>Fraud flagging</li>
                                <li>Manual review</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-4 text-primary">6. Limitation of Liability</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                SanctionX is not liable for:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-4">
                                <li>Rejection decisions by partner banks</li>
                                <li>Changes in interest rates</li>
                                <li>Credit bureau results</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-4 text-primary">7. Governing Law</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                This service operates under the laws of India and RBI Digital Lending Guidelines 2022.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
