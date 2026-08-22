"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Phone, User, Calendar, MapPin, Upload, Loader2, Link as LinkIcon, FileCheck, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BACKEND_URL = "http://localhost:8005";

import { supabase } from '@/lib/supabase-client';

export function Step1({ data, update, onNext, isEdit }: any) {
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState("");

    const handleNext = async () => {
        if (!data.fullName || (!isEdit && (!data.email || !data.password))) {
            setError("All fields are required");
            return;
        }

        if (isEdit) {
            onNext();
            return;
        }

        setLoading('auth');
        setError("");
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
            });
            if (authError) throw authError;
            
            // Temporary save UID to form data
            update({ userId: authData.user?.id });
            onNext();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">{isEdit ? "Edit Basic Details" : "Basic Details"}</h3>
            <p className="text-muted-foreground -mt-4 text-sm">{isEdit ? "Update your personal information." : "Create your account to start the application."}</p>
            
            {!isEdit && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-700 text-xs rounded-xl space-y-2">
                    <p className="font-bold flex items-center gap-2">
                        <Shield size={14} /> 
                        Testing Note: "Email rate exceeded"
                    </p>
                    <p>
                        Supabase limits how many signup emails can be sent per minute. If you see this error, please 
                        <strong> wait 60 seconds</strong> or use an existing account to log in.
                    </p>
                </div>
            )}

            {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="John Doe" value={data.fullName} onChange={(e) => update({ fullName: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="john@example.com" value={data.email} onChange={(e) => update({ email: e.target.value })} disabled={isEdit} />
                </div>
                <div className="space-y-2">
                    <Label>Mobile</Label>
                    <Input placeholder="+91 9988776655" value={data.mobile} onChange={(e) => update({ mobile: e.target.value })} />
                </div>
                {!isEdit && (
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input type="password" value={data.password} onChange={(e) => update({ password: e.target.value })} />
                    </div>
                )}
                <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup value={data.gender} onValueChange={(val) => update({ gender: val })} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Male" id="male" />
                            <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Female" id="female" />
                            <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Other" id="other" />
                            <Label htmlFor="other" className="font-normal cursor-pointer">Other</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={data.dateOfBirth} onChange={(e) => update({ dateOfBirth: e.target.value })} />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Current Address</Label>
                <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your present residential address..."
                    value={data.currentAddress}
                    onChange={(e) => update({ currentAddress: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label>Passport Size Photo (Profile Icon)</Label>
                <div className="p-4 border-2 border-dashed rounded-xl flex items-center gap-4 bg-muted/5 relative group hover:border-primary/50 transition-all">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden border-2 border-primary/20">
                        {data.profilePhotoUrl ? (
                            <img src={data.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={32} />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{data.profilePhotoFileName || "Select Photo"}</p>
                        <p className="text-[10px] text-muted-foreground">JPEG, PNG up to 2MB</p>
                    </div>
                    <Button variant="outline" size="sm" className="relative z-10">
                        {loading === 'photo' ? <Loader2 className="animate-spin" /> : <Upload size={14} className="mr-2" />}
                        Upload
                    </Button>
                    <Input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            const tempId = data.userId || `temp_${Date.now()}`;
                            setLoading('photo');
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('user_id', tempId);
                            formData.append('doc_type', 'profile_photo');

                            try {
                                const response = await fetch(`${BACKEND_URL}/upload-document`, {
                                    method: 'POST',
                                    body: formData,
                                });
                                if (!response.ok) throw new Error('Upload failed');
                                const result = await response.json();
                                update({ profilePhotoUrl: result.url, profilePhotoFileName: file.name, userId: data.userId || (isEdit ? tempId : undefined) });
                            } catch (err: any) {
                                alert("Failed to upload photo");
                            } finally {
                                setLoading(null);
                            }
                        }}
                    />
                </div>
            </div>

            <Button className="w-full h-12 text-md" onClick={handleNext} disabled={loading !== null}>
                {loading === 'auth' ? <Loader2 className="animate-spin mr-2" /> : null}
                Next: Identity Verification
            </Button>
        </div>
    );
}

export function Step2({ data, update, onNext, onPrev }: any) {
    const [verifying, setVerifying] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);
    
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'pan' | 'aadhaar') => {
        const file = e.target.files?.[0];
        if (!file || !data.userId) return;

        setUploading(type);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', data.userId);
        formData.append('doc_type', type);

        try {
            const response = await fetch(`${BACKEND_URL}/upload-document`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Upload failed');
            }
            const result = await response.json();
            if (type === 'pan') {
                update({ panCardUrl: result.url, panFileName: file.name });
            } else {
                update({ aadhaarCardUrl: result.url, aadhaarFileName: file.name });
            }
        } catch (err: any) {
            console.error("Upload failed", err);
            alert(`Upload failed: ${err.message}`);
        } finally {
            setUploading(null);
        }
    };

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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* PAN Upload */}
                    <div className="p-4 border-2 border-dashed rounded-xl flex flex-col items-center relative bg-muted/5 min-h-[140px] justify-center text-center">
                        <Upload className="text-muted-foreground mb-2" size={24} />
                        <p className="text-sm font-medium">{data.panCardUrl ? "PAN Uploaded ✅" : "Upload PAN Copy"}</p>
                        {data.panFileName && <p className="text-[10px] text-primary truncate max-w-full px-2">{data.panFileName}</p>}
                        {!data.panCardUrl && <p className="text-xs text-muted-foreground">PDF, JPEG or PNG</p>}
                        <Input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={(e) => handleFileUpload(e, 'pan')}
                            disabled={!!uploading}
                        />
                        {uploading === 'pan' && <Loader2 className="animate-spin mt-2" />}
                    </div>

                    {/* Aadhaar Upload */}
                    <div className="p-4 border-2 border-dashed rounded-xl flex flex-col items-center relative bg-muted/5 min-h-[140px] justify-center text-center">
                        <Upload className="text-muted-foreground mb-2" size={24} />
                        <p className="text-sm font-medium">{data.aadhaarCardUrl ? "Aadhaar Uploaded ✅" : "Upload Aadhaar Copy"}</p>
                        {data.aadhaarFileName && <p className="text-[10px] text-primary truncate max-w-full px-2">{data.aadhaarFileName}</p>}
                        {!data.aadhaarCardUrl && <p className="text-xs text-muted-foreground">Front & Back combined</p>}
                        <Input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={(e) => handleFileUpload(e, 'aadhaar')}
                            disabled={!!uploading}
                        />
                        {uploading === 'aadhaar' && <Loader2 className="animate-spin mt-2" />}
                    </div>
                </div>
            </div>
            <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-12" onClick={onPrev}>Back</Button>
                <Button className="flex-[2] h-12" onClick={handleVerify} disabled={verifying || !!uploading || !data.panCardUrl || !data.aadhaarCardUrl}>
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

                <div className="space-y-2 pt-2">
                    <Label>Employment Proof (ID Card / Offer Letter)</Label>
                    <div className="p-4 border-2 border-dashed rounded-xl flex items-center justify-between bg-muted/5 relative hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <Upload size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{data.employmentProofFileName || "Upload Proof"}</p>
                                <p className="text-[10px] text-muted-foreground">{data.employmentProofUrl ? "File Uploaded ✅" : "PDF, JPEG or PNG"}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="relative z-10" disabled={!!data.employmentProofUrl}>
                            {data.employmentProofUrl ? "Change" : "Select File"}
                        </Button>
                        <Input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file || !data.userId) return;
                                
                                const formData = new FormData();
                                formData.append('file', file);
                                formData.append('user_id', data.userId);
                                formData.append('doc_type', 'employment_proof');

                                try {
                                    const response = await fetch(`${BACKEND_URL}/upload-document`, {
                                        method: 'POST',
                                        body: formData,
                                    });
                                    if (!response.ok) throw new Error('Upload failed');
                                    const result = await response.json();
                                    update({ employmentProofUrl: result.url, employmentProofFileName: file.name });
                                } catch (err: any) {
                                    alert("Failed to upload employment proof");
                                }
                            }}
                        />
                    </div>
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !data.userId) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', data.userId);
        formData.append('doc_type', 'income');

        try {
            const response = await fetch(`${BACKEND_URL}/upload-document`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Upload failed');
            }
            const result = await response.json();
            update({ incomeDocUrl: result.url, incomeFileName: file.name, detectedIncome: Number(data.monthlyIncome) });
            onNext();
        } catch (err: any) {
            console.error("Upload failed", err);
            alert(`Upload failed: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold">Income Document OCR</h3>
            <p className="text-sm text-muted-foreground">Upload your latest salary slip or 3-month bank statement for automated verification.</p>
            <div className="p-8 border-2 border-dashed rounded-2xl flex flex-col items-center bg-muted/20 relative">
                <Upload size={48} className="text-primary mb-4" />
                <Button disabled={!!uploading}>
                    {uploading ? <Loader2 className="animate-spin mr-2" /> : <FileCheck className="mr-2" />}
                    {uploading ? "Analyzing Document..." : "Upload Salary Slip"}
                </Button>
                {data.incomeFileName && (
                    <p className="mt-4 text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full flex items-center gap-2">
                        <FileCheck size={16} /> {data.incomeFileName}
                    </p>
                )}
                <Input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleFileUpload}
                    disabled={!!uploading}
                />
            </div>
            <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 h-12" onClick={onPrev}>Back</Button>
            </div>
        </div>
    );
}

export function Step5({ data, update, onPrev, isEdit }: any) {
    const [finishing, setFinishing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleFinalize = async () => {
        setFinishing(true);
        setError("");
        try {
            const payload = {
                id: data.userId, // for update
                userId: data.userId, // for create
                fullName: data.fullName,
                email: data.email,
                mobile: data.mobile,
                dateOfBirth: data.dateOfBirth,
                gender: data.gender || 'Other',
                panNumber: data.panNumber,
                aadhaarNumber: data.aadhaarNumber,
                employmentStatus: data.employmentStatus,
                monthlyIncome: parseFloat(data.monthlyIncome),
                docIncome: parseFloat(data.detectedIncome),
                bankAccount: data.bankAccount || 'MOCK12345',
                ifscCode: data.ifscCode || 'IFSC0001',
                panCardUrl: data.panCardUrl,
                aadhaarCardUrl: data.aadhaar_card_url || data.aadhaarCardUrl, // fallback
                incomeDocUrl: data.income_proof_url || data.incomeDocUrl, // fallback
                profilePhotoUrl: data.profile_photo_url || data.profilePhotoUrl, // fallback
                employmentProofUrl: data.employment_proof_url || data.employmentProofUrl, // fallback
                currentAddress: data.currentAddress
            };

            const url = isEdit 
                ? `${BACKEND_URL}/update-profile`
                : `${BACKEND_URL}/register-validate`;
            
            const method = isEdit ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            const result = await response.json();
            if (response.ok && (result.status === 'success' || result.data)) {
                 if (isEdit) {
                    window.location.reload(); 
                 } else {
                    setSuccess(true);
                 }
            } else {
                const rawError = result.reason || result.detail || "Validation failed";
                // Defensive: If rawError is an object (like Pydantic's list of errors), 
                // stringify it or take the first message to avoid rendering objects in React.
                if (typeof rawError === 'object') {
                    if (Array.isArray(rawError)) {
                        setError(rawError[0]?.msg || JSON.stringify(rawError));
                    } else {
                        setError(rawError.msg || JSON.stringify(rawError));
                    }
                } else {
                    setError(rawError);
                }
            }
        } catch (err: any) {
            setError(err.message || "Finalization failed");
        } finally {
            setFinishing(false);
        }
    };

    return (
        success ? (
            <div className="text-center space-y-6 py-10 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-200">
                    <Mail size={36} />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Verification Email Sent!</h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Success! We have sent a confirmation link to <span className="font-semibold text-foreground">{data.email}</span>.
                    <br/>Please verify your account to proceed with your loan application.
                </p>
                <div className="pt-4">
                    <Button className="w-full max-w-xs h-12 text-md shadow-lg shadow-primary/20" onClick={() => router.push('/auth')}>
                        Go to Login
                    </Button>
                </div>
            </div>
        ) : (
        <div className="space-y-6 text-center">
            <h3 className="text-xl font-bold">{isEdit ? "Review Updates" : "Final Review & Consent"}</h3>
            {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg text-left">{error}</div>}
            <div className="bg-muted/30 p-4 rounded-xl text-left space-y-2 text-sm">
                <p><strong>Name:</strong> {data.fullName}</p>
                <p><strong>Email:</strong> {data.email}</p>
                <p><strong>Income Detected:</strong> ₹{data.detectedIncome?.toLocaleString()}</p>
                <p><strong>PAN:</strong> {data.panNumber}</p>
            </div>
            <div className="flex items-start space-x-2 text-left bg-primary/5 p-4 rounded-xl">
                <Checkbox id="consent" checked={data.consent} onCheckedChange={(val: any) => update({ consent: val })} />
                <label htmlFor="consent" className="text-xs leading-5">
                    I authorize SanctionX and its lending partners to pull my credit report and verify my income data. I accept all Terms of Service.
                </label>
            </div>
            <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-12" onClick={onPrev}>Back</Button>
                <Button className="flex-[2] h-12" onClick={handleFinalize} disabled={!data.consent || finishing}>
                    {finishing ? <Loader2 className="animate-spin mr-2" /> : (isEdit ? "Save Profile" : "Submit Application")}
                </Button>
            </div>
            </div>
        )
    );
}
