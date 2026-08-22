"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Phone, User, Calendar, MapPin, Upload, Loader2, Link as LinkIcon, FileCheck, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const BACKEND_URL = "http://127.0.0.1:8000";

export function Step1({ data, update, onNext }: any) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">Basic Details</h3>
            <p className="text-muted-foreground -mt-4 text-sm">Tell us about yourself to get started.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="John Doe" value={data.fullName} onChange={(e) => update({ fullName: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="john@example.com" value={data.email} onChange={(e) => update({ email: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label>Mobile</Label>
                    <Input placeholder="+91 9988776655" value={data.mobile} onChange={(e) => update({ mobile: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" value={data.password} onChange={(e) => update({ password: e.target.value })} />
                </div>
            </div>
            <Button className="w-full h-12 text-md" onClick={onNext}>Next: Identity Verification</Button>
        </div>
    );
}

export function Step2({ data, update, onNext, onPrev }: any) {
    const [verifying, setVerifying] = useState(false);
    
    const handleVerify = () => {
        setVerifying(true);
        setTimeout(() => {
            setVerifying(false);
            onNext();
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">Identity Verification</h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>PAN Card Number</Label>
                    <Input placeholder="ABCDE1234F" value={data.panNumber} onChange={(e) => update({ panNumber: e.target.value.toUpperCase() })} />
                </div>
                <div className="space-y-2">
                    <Label>Aadhaar Number</Label>
                    <Input placeholder="1234 5678 9012" value={data.aadhaarNumber} onChange={(e) => update({ aadhaarNumber: e.target.value })} />
                </div>
                <div className="p-4 border-2 border-dashed rounded-xl flex flex-col items-center">
                    <Upload className="text-muted-foreground mb-2" size={24} />
                    <p className="text-sm font-medium">Upload PAN Copy</p>
                    <p className="text-xs text-muted-foreground">PDF, JPEG or PNG (Max 5MB)</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-primary">Browse Files</Button>
                </div>
            </div>
            <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-12" onClick={onPrev}>Back</Button>
                <Button className="flex-[2] h-12" onClick={handleVerify} disabled={verifying}>
                    {verifying ? <Loader2 className="animate-spin mr-2" /> : <Shield className="mr-2" size={18} />}
                    Verify & Proceed
                </Button>
            </div>
        </div>
    );
}

export function Step3({ data, update, onNext, onPrev }: any) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">Employment Details</h3>
            <div className="space-y-4">
                <RadioGroup value={data.employmentStatus} onValueChange={(val) => update({ employmentStatus: val })}>
                    <div className="grid grid-cols-2 gap-4">
                        <Label className="flex items-center space-x-2 border p-4 rounded-xl cursor-pointer hover:bg-muted/50">
                            <RadioGroupItem value="Salaried" />
                            <span>Salaried</span>
                        </Label>
                        <Label className="flex items-center space-x-2 border p-4 rounded-xl cursor-pointer hover:bg-muted/50">
                            <RadioGroupItem value="Self-Employed" />
                            <span>Self-Employed</span>
                        </Label>
                    </div>
                </RadioGroup>
                <div className="space-y-2">
                    <Label>Workplace / Business Name</Label>
                    <Input value={data.workplace} onChange={(e) => update({ workplace: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label>Monthly Take-home Income</Label>
                    <Input type="number" placeholder="₹" value={data.monthlyIncome} onChange={(e) => update({ monthlyIncome: e.target.value })} />
                </div>
            </div>
            <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-12" onClick={onPrev}>Back</Button>
                <Button className="flex-[2] h-12" onClick={onNext}>Next: Income Proof</Button>
            </div>
        </div>
    );
}

export function Step4({ data, update, onNext, onPrev }: any) {
    const [uploading, setUploading] = useState(false);

    const handleMockOCR = () => {
        setUploading(true);
        setTimeout(() => {
            update({ detectedIncome: Number(data.monthlyIncome) * 0.95 });
            setUploading(false);
            onNext();
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">Income Document OCR</h3>
            <p className="text-sm text-muted-foreground">Upload your latest salary slip or 3-month bank statement for automated verification.</p>
            <div className="p-8 border-2 border-dashed rounded-2xl flex flex-col items-center bg-muted/20">
                <Upload size={48} className="text-primary mb-4" />
                <Button onClick={handleMockOCR} disabled={uploading}>
                    {uploading ? <Loader2 className="animate-spin mr-2" /> : <FileCheck className="mr-2" />}
                    {uploading ? "Analyzing Document..." : "Upload Salary Slip"}
                </Button>
            </div>
            <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 h-12" onClick={onPrev}>Back</Button>
            </div>
        </div>
    );
}

export function Step5({ data, update, onPrev }: any) {
    const [finishing, setFinishing] = useState(false);
    const router = useRouter();

    const handleFinalize = () => {
        setFinishing(true);
        setTimeout(() => {
            setFinishing(false);
            router.push('/dashboard');
        }, 2500);
    };

    return (
        <div className="space-y-6 text-center">
            <h3 className="text-xl font-bold">Final Review & Consent</h3>
            <div className="bg-muted/30 p-4 rounded-xl text-left space-y-2 text-sm">
                <p><strong>Name:</strong> {data.fullName}</p>
                <p><strong>Income Detected:</strong> ₹{data.detectedIncome?.toLocaleString()}</p>
                <p><strong>PAN:</strong> {data.panNumber}</p>
            </div>
            <div className="flex items-start space-x-2 text-left bg-primary/5 p-4 rounded-xl">
                <Checkbox id="consent" checked={data.consent} onCheckedChange={(val: boolean) => update({ consent: val })} />
                <label htmlFor="consent" className="text-xs leading-5">
                    I authorize SanctionX and its lending partners to pull my credit report and verify my income data. I accept all Terms of Service.
                </label>
            </div>
            <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-12" onClick={onPrev}>Back</Button>
                <Button className="flex-[2] h-12" onClick={handleFinalize} disabled={!data.consent || finishing}>
                    {finishing ? <Loader2 className="animate-spin mr-2" /> : "Submit Application"}
                </Button>
            </div>
        </div>
    );
}
