"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, FileText, Loader2, RefreshCcw } from "lucide-react";

const BACKEND_URL = "http://localhost:8005";

export default function AdminPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/applications`);
      const data = await res.json();
      setLoans(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch loans", e);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleApprove = async (userId: string) => {
    if (!confirm("Are you sure you want to APPROVE this loan?")) return;
    setProcessingId(userId);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchLoans();
      }
    } catch (e) {
      alert("Approval failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    const reason = prompt("Enter rejection reason (min 10 characters):");
    if (!reason) return;
    if (reason.length < 10) {
        alert("Reason too short.");
        return;
    }

    setProcessingId(userId);
    try {
        const res = await fetch(`${BACKEND_URL}/admin/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, reason: reason })
        });
        const data = await res.json();
        if (data.status === "success") {
            fetchLoans();
        } else {
            alert(data.detail || "Rejection failed");
        }
    } catch (e) {
        alert("Rejection failed");
    } finally {
        setProcessingId(null);
    }
  };

  const filteredLoans = loans.filter(loan => {
      if (activeTab === 'pending') {
          return loan.status === 'PENDING_MANUAL_REVIEW' || loan.status === 'PENDING_VERIFICATION';
      } else {
          return loan.status === 'APPROVED' || loan.status === 'REJECTED';
      }
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-500">Decision-making and application history.</p>
            </div>
            <div className="flex gap-4">
                <Button variant="outline" onClick={fetchLoans} className="gap-2 bg-white">
                    <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                </Button>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white p-1 rounded-xl shadow-sm border w-fit">
            <button 
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'pending' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary'
                }`}
            >
                Pending
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'history' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary'
                }`}
            >
                History
            </button>
        </div>

        <div className="grid gap-4">
          {loading ? (
             <div className="flex justify-center p-12">
                 <Loader2 className="animate-spin text-primary" size={32} />
             </div>
          ) : filteredLoans.length === 0 ? (
             <div className="text-center p-12 text-slate-500 bg-white rounded-xl shadow-sm border">
                 No {activeTab} applications found.
             </div>
          ) : (
            filteredLoans.map((loan) => (
              <Card key={loan.id} className={`overflow-hidden border-l-4 shadow-sm hover:shadow-md transition-shadow ${
                  loan.status === 'APPROVED' ? 'border-l-green-500' : 
                  loan.status === 'REJECTED' ? 'border-l-red-500' : 'border-l-primary'
              }`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                            {loan.user_profiles?.full_name || "Unknown User"}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            loan.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                            loan.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}>
                            {loan.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-4">
                        <div>
                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Loan Amount</p>
                            <p className="font-bold text-slate-900 leading-tight">₹{loan.loan_details_json?.amount?.toLocaleString() || loan.loan_amount?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Mon. Income</p>
                            <p className="font-bold text-slate-900 leading-tight">₹{loan.user_profiles?.declared_monthly_income?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Applied On</p>
                            <p className="font-medium text-slate-700 leading-tight">{loan.created_at ? new Date(loan.created_at).toLocaleDateString() : 'N/A'}</p>
                        </div>
                         <div>
                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Credit Score</p>
                            <p className={`font-bold text-lg leading-tight ${
                                (loan.risk_analysis?.total_score || 0) >= 80 ? 'text-green-600' :
                                (loan.risk_analysis?.total_score || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                                {loan.risk_analysis?.total_score || 0}%
                            </p>
                        </div>
                      </div>

                      {loan.status === 'REJECTED' && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                              <p className="text-xs font-bold text-red-700 mb-1 flex items-center gap-2 italic">
                                  <X size={12} /> Decision Reason:
                              </p>
                              <p className="text-sm text-red-600 font-medium">"{loan.rejection_reason}"</p>
                          </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {/* Risk Analysis Card */}
                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-3">
                            <h4 className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                                <RefreshCcw size={10} /> Risk Assessment
                            </h4>
                            <div className="space-y-2">
                                {loan.risk_analysis?.breakdown && Object.entries(loan.risk_analysis.breakdown).map(([key, data]: [string, any]) => (
                                    <div key={key} className="flex justify-between items-center text-xs">
                                        <span className="capitalize text-slate-500">{key.replace(/_/g, ' ')}:</span>
                                        <span className="font-mono font-bold text-slate-700">{data.score}/{data.max}</span>
                                    </div>
                                ))}
                                <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center">
                                    <span className="font-bold text-xs text-slate-900">Overall Category:</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        (loan.risk_analysis?.risk_category || '').includes('Low') ? 'bg-green-100 text-green-700' :
                                        (loan.risk_analysis?.risk_category || '').includes('Moderate') ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {loan.risk_analysis?.risk_category || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Uploaded Assets Card */}
                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-3">
                            <h4 className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                                <FileText size={10} /> Document Verification
                            </h4>
                            <div className="grid grid-cols-1 gap-1.5">
                                {[
                                    { label: "PAN Card", url: loan.user_profiles?.pan_card_url },
                                    { label: "Aadhaar Card", url: loan.user_profiles?.aadhaar_card_url },
                                    { label: "Income Proof", url: loan.user_profiles?.income_proof_url },
                                    { label: "Employment Proof", url: loan.user_profiles?.employment_proof_url }
                                ].map((doc, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-lg text-xs border border-slate-200 transition-colors hover:border-primary/30">
                                        <span className="font-medium text-slate-700">{doc.label}</span>
                                        {doc.url ? (
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline flex items-center gap-1">
                                                VIEW <FileText size={10} />
                                            </a>
                                        ) : (
                                            <span className="text-slate-300 font-bold italic">N/A</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col justify-start gap-2 min-w-[160px] pt-2">
                      {(loan.status === 'PENDING_MANUAL_REVIEW' || loan.status === 'PENDING_VERIFICATION') && (
                          <>
                            <Button 
                                onClick={() => handleApprove(loan.user_id)} 
                                disabled={!!processingId}
                                className="w-full bg-green-600 hover:bg-green-700 font-bold text-xs"
                            >
                                {processingId === loan.user_id ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} className="mr-2" />}
                                Approve App
                            </Button>
                            <Button 
                                onClick={() => handleReject(loan.user_id)}
                                disabled={!!processingId}
                                variant="destructive" 
                                className="w-full font-bold text-xs"
                            >
                                {processingId === loan.user_id ? <Loader2 className="animate-spin" size={14} /> : <X size={14} className="mr-2" />}
                                Reject App
                            </Button>
                          </>
                      )}
                      
                      {loan.sanction_letter_url && (
                          <a href={loan.sanction_letter_url} target="_blank" rel="noopener noreferrer" className="w-full">
                              <Button variant="outline" className="w-full border-2 font-bold text-xs bg-white text-primary border-primary/20 hover:bg-primary/5">
                                  <FileText size={14} className="mr-2" /> View Letter
                              </Button>
                          </a>
                      )}

                      {loan.status === 'REJECTED' && (
                          <div className="text-center p-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-dashed rounded-lg">
                              Case Closed
                          </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
