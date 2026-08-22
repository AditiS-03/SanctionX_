"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, LogOut, LayoutDashboard, FileText, Edit2, Shield, Check, X, ExternalLink, Menu, Download } from "lucide-react";
import { Step1, Step2, Step3, Step4, Step5 } from "../signup/components/steps";
import { Progress } from "@/components/ui/progress";
import Link from 'next/link';

const STEPS = [
    { id: 1, title: 'Basic Info' },
    { id: 2, title: 'Identity' },
    { id: 3, title: 'Employment' },
    { id: 4, title: 'Income OCR' },
    { id: 5, title: 'Finalize' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Edit Mode State
  const [currentStep, setCurrentStep] = useState(1);
  const [editFormData, setEditFormData] = useState<any>({});

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        fetchProfile(user.id);
      }
    };
    checkUser();
  }, [router]);

  const fetchProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setProfile(data);
        // Map profile data to form data structure expected by Steps
        setEditFormData({
            userId: data.id,
            fullName: data.full_name,
            email: data.email,
            mobile: data.mobile_number,
            age: data.age?.toString(),
            gender: data.gender,
            currentAddress: data.current_address,
            panNumber: data.pan_number,
            aadhaarNumber: data.aadhaar_number,
            employmentStatus: data.employment_type,
            monthlyIncome: data.declared_monthly_income,
            detectedIncome: data.declared_monthly_income,
            bankAccount: data.bank_account_number,
            ifscCode: data.ifsc_code,
            panCardUrl: data.pan_card_url,
            aadhaarCardUrl: data.aadhaar_card_url,
            incomeDocUrl: data.income_proof_url,
            profilePhotoUrl: data.profile_photo_url,
            employmentProofUrl: data.employment_proof_url,
            consent: true
        });
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Step Navigation for Edit Mode
  const updateFormData = (data: any) => {
    setEditFormData((prev: any) => ({ ...prev, ...data }));
  };
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border/50 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-border/50">
           <Link href="/" className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
               <Shield className="h-5 w-5 text-primary-foreground" />
             </div>
             <span className="font-bold text-lg">SanctionX</span>
           </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => router.push('/')}>
            <LayoutDashboard size={18} /> Home
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 bg-muted text-foreground">
            <User size={18} /> Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <FileText size={18} /> Applications
          </Button>
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
              {profile?.profile_photo_url ? (
                  <img src={profile.profile_photo_url} alt="P" className="w-full h-full object-cover" />
              ) : (
                  <span className="text-xs font-bold">{profile?.full_name?.charAt(0)}</span>
              )}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">{profile?.full_name || user?.email}</p>
              <p className="text-[10px] text-muted-foreground">Borrower</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
            
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{isEditing ? 'Edit Profile' : 'Your Profile'}</h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Update your details and re-verify.' : 'Manage your personal information and uploaded documents.'}
              </p>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="gap-2">
                <Edit2 size={16} /> Edit Profile
              </Button>
            ) : (
              <Button variant="outline" onClick={() => { setIsEditing(false); setCurrentStep(1); }} className="gap-2">
                <X size={16} /> Cancel Edit
              </Button>
            )}
          </div>

          {/* Render Edit Mode (Wizard) or View Mode (Summary) */}
          {isEditing ? (
             <div className="bg-background rounded-2xl shadow-sm border border-border/50 p-6">
                {/* Stepper Progress */}
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
                    <Progress value={(currentStep / STEPS.length) * 100} className="h-1" />
                </div>

                {/* Step Components */}
                <div className="min-h-[400px]">
                    {currentStep === 1 && <Step1 data={editFormData} update={updateFormData} onNext={nextStep} isEdit={true} />}
                    {currentStep === 2 && <Step2 data={editFormData} update={updateFormData} onNext={nextStep} onPrev={prevStep} isEdit={true} />}
                    {currentStep === 3 && <Step3 data={editFormData} update={updateFormData} onNext={nextStep} onPrev={prevStep} isEdit={true} />}
                    {currentStep === 4 && <Step4 data={editFormData} update={updateFormData} onNext={nextStep} onPrev={prevStep} isEdit={true} />}
                    {currentStep === 5 && <Step5 data={editFormData} update={updateFormData} onPrev={prevStep} isEdit={true} />}
                </div>
             </div>
          ) : (
             <div className="space-y-6">
                 {/* VIEW MODE */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <Card className="md:col-span-1">
                         <CardContent className="pt-6 flex flex-col items-center text-center">
                             <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden border-2 border-primary/20 mb-4">
                                {profile?.profile_photo_url ? (
                                    <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                        <User size={40} />
                                    </div>
                                )}
                             </div>
                             <h2 className="text-xl font-bold">{profile?.full_name}</h2>
                             <p className="text-sm text-muted-foreground mb-4">{profile?.email}</p>
                             <div className="w-full p-2 bg-green-500/10 text-green-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                                 <Shield size={14} /> KYC Verified
                             </div>
                         </CardContent>
                     </Card>

                     <Card className="md:col-span-2">
                         <CardHeader>
                             <CardTitle>Details</CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <p className="text-xs text-muted-foreground">Mobile</p>
                                     <p className="font-medium">{profile?.mobile_number || 'N/A'}</p>
                                 </div>
                                 <div>
                                     <p className="text-xs text-muted-foreground">Gender</p>
                                     <p className="font-medium">{profile?.gender || 'N/A'}</p>
                                 </div>
                                 <div className="col-span-2">
                                     <p className="text-xs text-muted-foreground">Address</p>
                                     <p className="font-medium">{profile?.current_address || 'N/A'}</p>
                                 </div>
                             </div>
                         </CardContent>
                     </Card>
                 </div>

                 <Card>
                     <CardHeader>
                         <CardTitle>Employment & Income</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="p-4 bg-muted/30 rounded-xl space-y-1">
                                 <p className="text-xs text-muted-foreground">Employment Type</p>
                                 <p className="font-bold">{profile?.employment_type || 'N/A'}</p>
                             </div>
                             <div className="p-4 bg-muted/30 rounded-xl space-y-1">
                                 <p className="text-xs text-muted-foreground">Monthly Income</p>
                                 <p className="font-bold">₹ {profile?.declared_monthly_income?.toLocaleString() || '0'}</p>
                             </div>
                             <div className="p-4 bg-muted/30 rounded-xl space-y-1">
                                 <p className="text-xs text-muted-foreground">PAN Number</p>
                                 <p className="font-bold uppercase">{profile?.pan_number || 'N/A'}</p>
                             </div>
                         </div>
                     </CardContent>
                 </Card>

                  <Card>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                              <FileText size={20} className="text-primary" />
                              Application History
                          </CardTitle>
                          <CardDescription>Track your active and past loan applications.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <ApplicationList userId={user?.id} />
                      </CardContent>
                  </Card>

                 <Card>
                     <CardHeader>
                         <CardTitle>Documents</CardTitle>
                     </CardHeader>
                     <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: 'PAN Card', url: profile?.pan_card_url },
                            { label: 'Aadhaar Card', url: profile?.aadhaar_card_url },
                            { label: 'Income Proof', url: profile?.income_proof_url },
                            { label: 'Employment Proof', url: profile?.employment_proof_url }
                        ].map((doc, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-500/10 p-2 rounded text-blue-600">
                                        <FileText size={18} />
                                    </div>
                                    <span className="font-medium text-sm">{doc.label}</span>
                                </div>
                                {doc.url ? (
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors flex items-center gap-1">
                                        View <ExternalLink size={12} />
                                    </a>
                                ) : (
                                    <span className="text-xs text-muted-foreground italic">Not Uploaded</span>
                                )}
                            </div>
                        ))}
                     </CardContent>
                 </Card>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ApplicationList({ userId }: { userId: string }) {
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        const fetchApps = async () => {
            const { data, error } = await supabase
                .from('loan_applications')
                .select('*')
                .eq('user_id', userId)
                .eq('show_on_profile', true)
                .order('created_at', { ascending: false });
            
            if (data) setApps(data);
            setLoading(false);
        };
        fetchApps();
    }, [userId]);

    if (loading) return <p className="text-sm text-muted-foreground">Loading applications...</p>;
    if (apps.length === 0) return <p className="text-sm text-muted-foreground">No applications found.</p>;

    return (
        <div className="space-y-4">
            {apps.map((app) => (
                <div key={app.id} className="flex flex-col p-4 border rounded-xl gap-4 bg-muted/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-bold">₹ {app.loan_amount?.toLocaleString()}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                    app.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                                    app.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                                    'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                }`}>
                                    {app.status?.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Applied on: {new Date(app.created_at || app.applied_at || Date.now()).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {app.status === 'APPROVED' && app.sanction_letter_url && (
                                <Button variant="default" size="sm" className="gap-2" asChild>
                                    <a href={app.sanction_letter_url} target="_blank" rel="noopener noreferrer">
                                        <Download size={14} /> Download Sanction
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                    {app.status === 'REJECTED' && app.rejection_reason && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                            <p className="text-xs font-bold text-red-700 mb-1">Rejection Reason:</p>
                            <p className="text-sm text-red-600">{app.rejection_reason}</p>
                        </div>
                    )}
                    {app.status === 'PENDING_MANUAL_REVIEW' && (
                        <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                             <Shield size={12} />
                             Our credit team is currently reviewing your documents for final approval.
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
