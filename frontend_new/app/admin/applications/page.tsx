"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Check, X, FileText, Loader2, Shield, AlertTriangle, 
  Search, Eye, ExternalLink, MessageSquare, User,
  IndianRupee, Calendar, TrendingUp, Download, Info
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const BACKEND_URL = "http://localhost:8000";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/applications`);
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch applications", e);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    const interval = setInterval(fetchApps, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async () => {
    if (!selectedApp) return;
    setProcessing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: selectedApp.user_id,
          admin_id: "admin_123" 
        })
      });
      if (res.ok) {
        setSelectedApp(null);
        fetchApps();
      }
    } catch (e) {
      alert("Approve failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp || rejectReason.length < 10) return;
    setProcessing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: selectedApp.user_id,
          reason: rejectReason 
        })
      });
      if (res.ok) {
        setIsRejectModalOpen(false);
        setRejectReason("");
        setSelectedApp(null);
        fetchApps();
      }
    } catch (e) {
      alert("Reject failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">APPLICATION PORTAL</h1>
              <p className="text-slate-500 font-medium">Manual Loan Verification & Underwriting</p>
            </div>
            <div className="flex gap-3">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                   placeholder="Search by name, pan..." 
                   className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64 transition-all"
                 />
               </div>
               <Button variant="outline" onClick={fetchApps} className="rounded-xl">
                 Refresh
               </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Table List View */}
            <div className={`space-y-4 ${selectedApp ? 'lg:col-span-1 hidden lg:block' : 'lg:col-span-4'}`}>
              {loading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>
              ) : applications.length === 0 ? (
                <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 font-medium">No pending applications found.</div>
              ) : (
                applications.map((app) => (
                  <Card 
                    key={app.id} 
                    onClick={() => setSelectedApp(app)}
                    className={`cursor-pointer transition-all border-l-4 hover:shadow-lg ${
                      selectedApp?.id === app.id ? 'border-l-primary bg-primary/5 shadow-md' : 'border-l-transparent hover:border-l-slate-300'
                    } rounded-2xl`}
                  >
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                               {app.user_profiles?.full_name?.charAt(0) || "U"}
                            </div>
                            <div>
                               <p className="font-bold text-slate-900">{app.user_profiles?.full_name || "Unknown Applicant"}</p>
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{app.loan_details_json?.purpose || "Personal"}</p>
                            </div>
                         </div>
                         <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                           app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                           app.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                         }`}>
                           {app.status?.replace(/_/g, ' ')}
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-0.5">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Amount</p>
                             <p className="font-bold text-sm text-slate-700">₹{app.loan_details_json?.amount?.toLocaleString()}</p>
                         </div>
                         <div className="space-y-0.5">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Credit Score</p>
                            <p className="font-bold text-sm text-primary">{app.risk_json?.credit_score || "N/A"}</p>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Detail View Pane */}
            {selectedApp && (
              <div className="lg:col-span-3 space-y-6 pb-24 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                   <div className="flex items-center gap-4">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedApp(null)} className="lg:hidden">
                        <X size={20} />
                      </Button>
                      <h2 className="text-xl font-black text-slate-900">APPLICATION #ID-{selectedApp.id.slice(0, 8)}</h2>
                   </div>
                   <div className="flex items-center gap-2">
                       <span className="text-xs text-slate-500 font-bold">Applied: {new Date(selectedApp.created_at).toLocaleString()}</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Profile */}
                  <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                      <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-tight">
                        <User size={16} className="text-primary" /> User Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">Full Name</p>
                             <p className="text-sm font-bold">{selectedApp.user_profiles?.full_name}</p>
                          </div>
                          <div>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                             <p className="text-sm font-bold">{selectedApp.user_profiles?.email}</p>
                          </div>
                          <div>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">Age / Gender</p>
                             <p className="text-sm font-bold">{selectedApp.user_profiles?.age} / {selectedApp.user_profiles?.gender}</p>
                          </div>
                          <div>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">Mobile</p>
                             <p className="text-sm font-bold">{selectedApp.user_profiles?.mobile_number}</p>
                          </div>
                       </div>
                       <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">ID Verification</p>
                          <div className="flex gap-4">
                             <div>
                                <p className="text-[10px] text-slate-500">PAN Number</p>
                                <p className="text-xs font-mono font-bold">****{selectedApp.user_profiles?.pan_number?.slice(-4)}</p>
                             </div>
                             <div>
                                <p className="text-[10px] text-slate-500">Aadhaar</p>
                                <p className="text-xs font-mono font-bold">****{selectedApp.user_profiles?.aadhaar_number?.slice(-4)}</p>
                             </div>
                          </div>
                       </div>
                    </CardContent>
                  </Card>

                  {/* Loan Details */}
                  <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                      <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-tight">
                        <IndianRupee size={16} className="text-primary" /> Loan Parameters
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                       <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl mb-4 border border-primary/10">
                          <div>
                             <p className="text-xs text-primary font-bold uppercase">Requested Amount</p>
                             <p className="text-2xl font-black text-primary">₹{selectedApp.loan_details_json?.amount?.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs text-slate-500 font-bold uppercase">EMI</p>
                             <p className="text-xl font-bold text-slate-700">₹{selectedApp.loan_details_json?.emi?.toLocaleString()}/mo</p>
                          </div>
                       </div>
                       <div className="grid grid-cols-3 gap-2">
                          <div className="p-3 bg-slate-50 rounded-xl text-center">
                             <p className="text-[10px] text-slate-400 font-bold uppercase">Tenure</p>
                             <p className="text-sm font-bold">{selectedApp.loan_details_json?.tenure} mo</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl text-center">
                             <p className="text-[10px] text-slate-400 font-bold uppercase">Rate</p>
                             <p className="text-sm font-bold text-emerald-600">{selectedApp.loan_details_json?.rate}%</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl text-center">
                             <p className="text-[10px] text-slate-400 font-bold uppercase">KFS</p>
                             <p className="text-[10px] font-black text-emerald-600">ACCEPTED</p>
                          </div>
                       </div>
                    </CardContent>
                  </Card>

                  {/* Risk + Eligibility */}
                  <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                      <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-tight">
                        <Shield size={16} className="text-amber-500" /> Risk Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                       <div className="flex gap-4">
                          <div className="flex-1 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                             <p className="text-[10px] text-amber-600 font-bold uppercase mb-1">Fraud Flags</p>
                             <div className="space-y-1">
                                {selectedApp.risk_json?.fraud_flags?.length > 0 ? (
                                   selectedApp.risk_json.fraud_flags.map((f: string, i: number) => (
                                      <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-red-600">
                                         <AlertTriangle size={10} /> {f}
                                      </div>
                                   ))
                                ) : (
                                   <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1.5"><Check size={10} /> No high risk flags</p>
                                )}
                             </div>
                          </div>
                          <div className="w-1/3 p-3 bg-slate-50 rounded-xl text-center">
                             <p className="text-[10px] text-slate-400 font-bold uppercase">Eligibility</p>
                             <p className="text-lg font-black">{selectedApp.risk_json?.eligibility_score}%</p>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 border border-slate-100 rounded-xl">
                             <p className="text-[10px] text-slate-400 font-bold uppercase">Income Var.</p>
                             <p className={`text-sm font-bold ${selectedApp.risk_json?.income_mismatch > 20 ? 'text-rose-600' : 'text-slate-700'}`}>
                                {selectedApp.risk_json?.income_mismatch || 0}%
                             </p>
                          </div>
                          <div className="p-3 border border-slate-100 rounded-xl">
                             <p className="text-[10px] text-slate-400 font-bold uppercase">Bureau Score</p>
                             <p className="text-sm font-bold text-primary">{selectedApp.risk_json?.credit_score || "N/A"}</p>
                          </div>
                       </div>
                    </CardContent>
                  </Card>

                  {/* Documents */}
                  <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                      <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-tight">
                        <FileText size={16} className="text-primary" /> Uploaded Assets
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                       <div className="grid grid-cols-1 gap-2">
                          {[
                            { name: "PAN Card", url: selectedApp.doc_urls_json?.pan },
                            { name: "Aadhaar Card", url: selectedApp.doc_urls_json?.aadhaar },
                            { name: "Income Proof", url: selectedApp.doc_urls_json?.income_proof },
                            { name: "Work Proof", url: selectedApp.doc_urls_json?.employment_proof },
                            { name: "Purpose Evidence", url: selectedApp.doc_urls_json?.purpose_proof }
                          ].map((doc, i) => (
                             <div key={i} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-2">
                                   <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                      <FileText size={14} />
                                   </div>
                                   <span className="text-xs font-bold text-slate-700">{doc.name}</span>
                                </div>
                                {doc.url ? (
                                   <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white hover:shadow-sm">
                                         <Eye size={14} />
                                      </Button>
                                   </a>
                                ) : (
                                   <span className="text-[8px] font-black text-slate-400 uppercase">Missing</span>
                                )}
                             </div>
                          ))}
                       </div>
                    </CardContent>
                  </Card>

                  {/* Chat Summary */}
                  <Card className="md:col-span-2 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                      <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-tight">
                        <MessageSquare size={16} className="text-primary" /> Application Narrative (Chat Summary)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                       <div className="p-4 bg-muted/40 rounded-2xl italic text-slate-600 text-sm border border-slate-200">
                          "{selectedApp.chat_summary || "No chat summary available."}"
                       </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Fixed Action Bar */}
                <div className="fixed bottom-6 right-8 left-8 lg:left-[calc(25%+2rem)] flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] z-50 animate-in slide-in-from-bottom-4 duration-500">
                   <div className="hidden sm:flex items-center gap-2 pl-4 border-l-4 border-primary ml-2">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">Action Required</p>
                      <Info size={14} className="text-slate-400" />
                   </div>
                   <div className="flex gap-4">
                      <Button 
                         variant="outline" 
                         onClick={() => setIsRejectModalOpen(true)}
                         className="px-8 rounded-2xl py-6 font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all font-mono tracking-tighter"
                      >
                         <X size={18} className="mr-2" /> REJECT APPLICATION
                      </Button>
                      <Button 
                         onClick={handleApprove}
                         disabled={processing}
                         className="px-12 rounded-2xl py-6 font-black bg-primary text-white hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 tracking-tighter"
                      >
                         {processing ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} className="mr-2" />}
                         APPROVE & DISBURSE
                      </Button>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-8 border-none ring-1 ring-slate-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">REJECT APPLICATION</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              Please enter a detailed reason for rejection. This will be shared with the applicant via the secure chat.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <Textarea 
               placeholder="Example: Monthly income mismatch exceeds 30% tolerance..."
               value={rejectReason}
               onChange={(e) => setRejectReason(e.target.value)}
               className="min-h-[150px] rounded-2xl border-slate-100 bg-slate-50 focus:ring-rose-500/20"
             />
             <div className="flex items-center gap-2">
                <div className={`h-1.5 flex-1 rounded-full transition-all ${rejectReason.length >= 10 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[70px]">
                   {rejectReason.length < 10 ? 'TOO SHORT' : 'VALIDATED'}
                </span>
             </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-between sm:space-x-0">
             <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)} className="rounded-xl font-bold">CANCEL</Button>
             <Button 
                onClick={handleReject} 
                className="bg-rose-600 text-white hover:bg-rose-700 rounded-xl font-black px-8"
                disabled={rejectReason.length < 10 || processing}
             >
                {processing ? <Loader2 className="animate-spin" size={18} /> : "SUBMIT REJECTION"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
