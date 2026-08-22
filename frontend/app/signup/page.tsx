
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Step1, Step2, Step3, Step4, Step5 } from './components/steps';

const STEPS = [
    { id: 1, title: 'Basic Info' },
    { id: 2, title: 'Identity' },
    { id: 3, title: 'Employment' },
    { id: 4, title: 'Income OCR' },
    { id: 5, title: 'Finalize' },
];

export default function SignupPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '', age: '', gender: '', mobile: '', email: '', password: '',
        panNumber: '', aadhaarNumber: '', panCardUrl: '', aadhaarCardUrl: '',
        employmentStatus: 'Salaried', workplace: '', monthlyIncome: '', employmentProofUrl: '',
        incomeDocUrl: '', detectedIncome: null,
        bankAccount: '', ifscCode: '', consent: false
    });

    const updateFormData = (data: any) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const progress = (currentStep / STEPS.length) * 100;

    return (
        <div className="min-h-screen bg-muted/30 pb-20">
            {/* Header */}
            <header className="bg-background border-b border-border/50 sticky top-0 z-10 box-border">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold">SanctionX</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/auth')}>Cancel</Button>
                </div>
            </header>

            {/* Stepper UI */}
            <div className="max-w-4xl mx-auto px-4 mt-8">
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {STEPS.map((step) => (
                            <div key={step.id} className="flex flex-col items-center flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                }`}>
                                    {currentStep > step.id ? <Check size={14} /> : step.id}
                                </div>
                                <span className={`text-[10px] mt-1 hidden sm:block ${
                                    currentStep >= step.id ? 'text-foreground font-medium' : 'text-muted-foreground'
                                }`}>{step.title}</span>
                            </div>
                        ))}
                    </div>
                    <Progress value={progress} className="h-1" />
                </div>

                {/* Step Content Card */}
                <div className="bg-background rounded-2xl shadow-xl border border-border/50 overflow-hidden">
                    <div className="p-6 md:p-8">
                        {currentStep === 1 && <Step1 data={formData} update={updateFormData} onNext={nextStep} />}
                        {currentStep === 2 && <Step2 data={formData} update={updateFormData} onNext={nextStep} onPrev={prevStep} />}
                        {currentStep === 3 && <Step3 data={formData} update={updateFormData} onNext={nextStep} onPrev={prevStep} />}
                        {currentStep === 4 && <Step4 data={formData} update={updateFormData} onNext={nextStep} onPrev={prevStep} />}
                        {currentStep === 5 && <Step5 data={formData} update={updateFormData} onPrev={prevStep} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
