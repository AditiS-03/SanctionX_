"use client";

import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Shield, Eye, Lock } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen">
            <Header />
            <div className="pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Shield className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h1 className="text-3xl font-bold">Privacy Policy</h1>
                    </div>

                    <div className="prose prose-slate max-w-none space-y-8">
                        <div>
                            <h2 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                                <Eye className="h-5 w-5" /> 1. Data We Collect
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-muted-foreground pl-7">
                                <li>• Full Name</li>
                                <li>• Date of Birth</li>
                                <li>• PAN Number (masked except last 4 digits)</li>
                                <li>• Aadhaar Number (used only for eKYC)</li>
                                <li>• Employment details</li>
                                <li>• Income details</li>
                                <li>• Uploaded documents</li>
                                <li>• Bank account information</li>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                                <Shield className="h-5 w-5" /> 2. How We Use Data
                            </h2>
                            <p className="text-muted-foreground mb-4 pl-7">We use collected data for:</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-11">
                                <li>Identity verification</li>
                                <li>Eligibility assessment</li>
                                <li>Fraud detection</li>
                                <li>Loan application processing</li>
                                <li>Sanction letter generation</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                                <Lock className="h-5 w-5" /> 3. Data Storage & Security
                            </h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-11">
                                <li>Data stored securely using Supabase</li>
                                <li>Documents stored in private storage buckets</li>
                                <li>PAN masked in UI</li>
                                <li>AES-256 encryption in transit</li>
                                <li>User-scoped access rules</li>
                                <li>Admin access restricted</li>
                            </ul>
                        </div>

                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                            <h2 className="text-xl font-bold mb-4 text-primary">4. Consent</h2>
                            <p className="text-muted-foreground mb-4">Users must explicitly agree to:</p>
                            <div className="space-y-2 pl-4">
                                <p className="text-sm font-medium flex items-center gap-2">✅ KYC verification</p>
                                <p className="text-sm font-medium flex items-center gap-2">✅ Secure document processing</p>
                                <p className="text-sm font-medium flex items-center gap-2">✅ Data usage for loan processing</p>
                            </div>
                            <p className="mt-4 text-sm italic text-primary/70">No data is shared without consent.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-4 text-primary">5. Third-Party Sharing</h2>
                            <p className="text-muted-foreground mb-2 pl-7">Data may be shared only with:</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-11">
                                <li>RBI-regulated Banks</li>
                                <li>NBFC partners</li>
                                <li>Credit bureaus (mock/demo)</li>
                            </ul>
                            <p className="mt-4 font-bold text-foreground pl-7">No data is sold to third parties.</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-4 text-primary">6. Data Retention</h2>
                            <p className="text-muted-foreground pl-7">
                                User data is retained only as required for regulatory and loan processing purposes.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-4 text-primary">7. User Rights (DPDP Compliance)</h2>
                            <p className="text-muted-foreground mb-4 pl-7">Users may:</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-11">
                                <li>Request access to stored data</li>
                                <li>Request correction</li>
                                <li>Request deletion (subject to regulatory obligations)</li>
                            </ul>
                        </div>

                        <div className="pt-8 border-t border-border text-center">
                            <h2 className="text-xl font-bold mb-4">Contact</h2>
                            <p className="text-primary font-medium">support@sanctionx.in</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
