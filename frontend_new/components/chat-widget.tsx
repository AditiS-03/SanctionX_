
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Loader2, Download, ChevronRight, Info, Bot, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const BACKEND_URL = "http://localhost:8005";

interface Message {
  role: 'bot' | 'user';
  text: string;
  file?: {
    name: string;
    url: string;
    type: string;
  };
}

interface ChatWidgetProps {
  userId?: string;
}

export function ChatWidget({ userId = "demo-user" }: ChatWidgetProps) {
  const SESSION_ID = userId || "demo-user";
  /* 
   * Initialize with the EXACT welcome message requested. 
   * This ensures it appears immediately on load/refresh.
   */
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Welcome to SanctionX! 👋 I'm your digital loan officer. How can I assist you with your loan application today?" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [loanOptions, setLoanOptions] = useState<any[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [showKFS, setShowKFS] = useState(false);
  const [kfsAccepted, setKfsAccepted] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startConversation();
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, typing]);

  const startConversation = async () => {
    try {
      // Send a silent reset/init signal to backend
      // We don't display the response because we already show the static welcome message
      await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: SESSION_ID, message: "start" }),
      });
      // No setMessages here
    } catch (e) {
      console.error("Start Conversation Error:", e);
    }
  };

  const sendMessage = async (msg = input) => {
    if (!msg.trim()) return;
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: SESSION_ID, message: msg }),
      });
      const data = await res.json();
      setTyping(false);

      if (data.reply.startsWith("MATCH_FOUND")) {
        // Extract score if present
        const parts = data.reply.split("::");
        const score = parts.length > 1 ? parts[1] : "750";
        
        setMessages((m) => [...m, { 
            role: "bot", 
            text: `We have checked your credit history. Your Credit Score is ${score}. You have a high probability of loan approval! \n\nHere are the loan options you are eligible for:` 
        }]);
        
        setLoanOptions([
          { amount: 500000, rate: 10.5, tenure: 12, emi: 44000, total: 528000 },
          { amount: 500000, rate: 11.2, tenure: 24, emi: 23000, total: 552000 },
          { amount: 500000, rate: 12.0, tenure: 36, emi: 16000, total: 576000 }
        ]);
      } else if (data.reply.includes("|||")) {
          // Split multiple messages
          const msgs = data.reply.split("|||");
          msgs.forEach((text: string, index: number) => {
              if (text.trim()) {
                  if (text.startsWith("MATCH_FOUND")) {
                      const parts = text.split("::");
                      const score = parts.length > 1 ? parts[1] : "750";
                      
                      setTimeout(() => {
                        setMessages((m) => [...m, { 
                            role: "bot", 
                            text: `We have checked your credit history. Your Credit Score is ${score}. You have a high probability of loan approval! \n\nHere are the loan options you are eligible for:` 
                        }]);
                        setLoanOptions([
                            { amount: 500000, rate: 10.5, tenure: 12, emi: 44000, total: 528000 },
                            { amount: 500000, rate: 11.2, tenure: 24, emi: 23000, total: 552000 },
                            { amount: 500000, rate: 12.0, tenure: 36, emi: 16000, total: 576000 }
                        ]);
                      }, index * 800);
                  } else {
                      setTimeout(() => {
                        setMessages((m) => [...m, { role: "bot", text: text.trim() }]);
                      }, index * 800);
                  }
              }
          });
      } else {
        setMessages((m) => [...m, { role: "bot", text: data.reply }]);
      }
    } catch (e) {
      setTyping(false);
      setMessages((m) => [...m, { role: "bot", text: "Oops! Something went wrong on our end." }]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTyping(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', SESSION_ID);
    formData.append('doc_type', 'loan_proof'); // General loan proof document (don't overwrite original income)

    try {
      const response = await fetch(`${BACKEND_URL}/upload-document`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      
      // Add user message with file preview
      setMessages((m) => [...m, { 
        role: "user", 
        text: `Uploaded: ${file.name}`,
        file: {
          name: file.name,
          url: result.url,
          type: file.type
        }
      }]);

      // Call chat to trigger verification logic in orchestrator
      // We don't verify the text here, we let the backend handle it based on state
      const chatRes = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: SESSION_ID, message: "PROOF_UPLOADED" }),
      });
      const chatData = await chatRes.json();
      
      setTyping(false);
      
      if (chatData.reply.includes("|||")) {
          const msgs = chatData.reply.split("|||");
          msgs.forEach((text: string) => {
              if (text.trim()) {
                  setMessages((m) => [...m, { role: "bot", text: text.trim() }]);
              }
          });
      } else {
          setMessages((m) => [...m, { role: "bot", text: chatData.reply }]);
      }

    } catch (err: any) {
      setTyping(false);
      setMessages((m) => [...m, { role: "bot", text: "Failed to upload document. Please try again." }]);
    } finally {
      // Reset file input to allow re-uploading the same file
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const selectOption = (opt: any) => {
    setSelectedLoan(opt);
    setShowKFS(true);
  };

  const acceptKFS = async () => {
    if (!kfsAccepted) return;
    setShowKFS(false);
    setMessages((m) => [...m, { role: "user", text: `I accept the offer for ₹${selectedLoan.amount}` }]);
    setTyping(true);

    try {
        // Submit Application
        const res = await fetch(`${BACKEND_URL}/submit-application?session_id=${SESSION_ID}&amount=${selectedLoan.amount}&tenure=${selectedLoan.tenure}&rate=${selectedLoan.rate}`);
        const data = await res.json();
        
        setTyping(false);
        
        if (data.status === "submitted") {
            setMessages((m) => [...m, { 
                role: "bot", 
                text: "✅ Application Submitted Successfully!\n\nYour profile is now under Manual Verification. Please wait for approx 30 minutes while our credit team reviews your documents. You can also check your applications in the Profile section." 
            }]);
            
            setApplicationStatus([
                { label: "Docs Verified", status: "completed" },
                { label: "Risk Review", status: "completed" },
                { label: "Manual Verification", status: "current" },
                { label: "Approved", status: "pending" }
            ]);

            // Start Polling
            const interval = setInterval(async () => {
                try {
                    const statusRes = await fetch(`${BACKEND_URL}/application-status?session_id=${SESSION_ID}`);
                    const statusData = await statusRes.json();
                    
                    // 1. Process System Messages (Injected by Admin)
                    if (statusData.system_messages && statusData.system_messages.length > 0) {
                        statusData.system_messages.forEach((msg: string) => {
                            setMessages((m) => [...m, { role: "bot", text: msg }]);
                        });
                    }

                    // 2. Handle Approval
                    if (statusData.status === "APPROVED" && statusData.url) {
                        clearInterval(interval);
                        setApplicationStatus([
                            { label: "Docs Verified", status: "completed" },
                            { label: "Risk Review", status: "completed" },
                            { label: "Manual Verification", status: "completed" },
                            { label: "Approved", status: "completed" },
                            { label: "Letter Generated", status: "completed" }
                        ]);
                        
                        setMessages((m) => [...m, { 
                            role: "bot", 
                            text: "📄 Sanction Letter Available\n\nYour digital sanction is ready. Please download and review the final terms.",
                            file: { name: "Sanction_Letter.pdf", url: statusData.url, type: "application/pdf" }
                        }]);
                    }

                    // 3. Handle Rejection
                    if (statusData.status === "REJECTED") {
                        clearInterval(interval);
                        setApplicationStatus([
                            { label: "Docs Verified", status: "completed" },
                            { label: "Risk Review", status: "completed" },
                            { label: "Manual Verification", status: "failed" },
                            { label: "Approved", status: "pending" }
                        ]);
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 5000); 

        } else {
            setMessages((m) => [...m, { role: "bot", text: "Submission failed. Please try again." }]);
        }
    } catch (e) {
        setTyping(false);
        setMessages((m) => [...m, { role: "bot", text: "Something went wrong submitting the application." }]);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-background relative border-0">
      {/* Chat Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide scroll-smooth"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
                m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none border border-border/50"
              }`}>
              {m.file ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-background/20 p-2 rounded-lg border border-white/20">
                    <div className="bg-white/10 p-2 rounded">
                      <FileText size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-xs truncate">{m.file.name}</p>
                      <p className="text-[10px] opacity-70">{(m.file.type || 'document').toUpperCase()}</p>
                    </div>
                  </div>
                  {m.text && <p>{m.text}</p>}
                </div>
              ) : (
                m.text
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-2xl border border-border/50 shadow-sm">
              <Loader2 className="animate-spin text-primary" size={16} />
            </div>
          </div>
        )}

        {/* Loan Option Cards */}
        {loanOptions.length > 0 && !selectedLoan && (
          <div className="grid grid-cols-1 gap-3 py-2">
            {loanOptions.map((opt, i) => (
              <Card key={i} className="border-2 border-primary/10 rounded-xl p-4 shadow-md hover:border-primary/40 transition-all group cursor-pointer" onClick={() => selectOption(opt)}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xl font-bold">₹{opt.amount.toLocaleString()}</span>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{opt.rate}% APR</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-muted-foreground">
                  <div>Tenure: <span className="text-foreground font-semibold">{opt.tenure} Months</span></div>
                  <div>EMI: <span className="text-foreground font-semibold">₹{opt.emi.toLocaleString()}</span></div>
                </div>
                <Button size="sm" className="w-full">
                  Select <ChevronRight size={14} className="ml-1" />
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Status Tracker */}
        {applicationStatus.length > 0 && (
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50 shadow-sm space-y-3">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Application Timeline</h4>
            <div className="flex items-center justify-between px-2">
              {applicationStatus.map((step, i) => (
                <div key={i} className="flex flex-col items-center relative">
                  <div className={`w-2.5 h-2.5 rounded-full mb-1 z-10 ${
                      step.status === 'completed' ? 'bg-primary' : step.status === 'current' ? 'bg-yellow-500 animate-pulse' : 'bg-muted-foreground/30'
                    }`}></div>
                  <span className="text-[8px] text-muted-foreground text-center max-w-[40px] leading-tight">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sanction Letter Download */}
        {applicationStatus.some(s => s.label === "Letter Generated") && (
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mr-3">
                <Download size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Sanction Letter</p>
                <p className="text-xs text-muted-foreground italic">Ready for disbursement</p>
              </div>
            </div>
            <a href={`${BACKEND_URL}/generate-sanction?session_id=${SESSION_ID}`} target="_blank" rel="noopener noreferrer">
                <Button size="icon" variant="outline" className="rounded-full">
                    <Download size={18} />
                </Button>
            </a>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* KFS Overlay Integration */}
      {showKFS && (
        <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex items-end p-4">
          <Card className="w-full shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="bg-primary p-3 text-primary-foreground flex justify-between rounded-t-lg">
              <h4 className="font-bold text-sm flex items-center"><Info size={14} className="mr-2" /> Key Fact Statement</h4>
            </div>
            <CardContent className="p-4 space-y-4">
              <div className="bg-muted p-3 rounded-lg grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <span className="text-muted-foreground">Principal:</span> <span className="font-bold">₹{selectedLoan.amount}</span>
                <span className="text-muted-foreground">Rate:</span> <span className="font-bold">{selectedLoan.rate}%</span>
                <span className="text-muted-foreground">EMI:</span> <span className="font-bold">₹{selectedLoan.emi}</span>
              </div>
              <div className="flex items-start space-x-2">
                <input type="checkbox" id="kfs-agree" checked={kfsAccepted} onChange={(e) => setKfsAccepted(e.target.checked)} className="mt-1" />
                <label htmlFor="kfs-agree" className="text-[10px] text-muted-foreground leading-normal">
                  I accept the KFS and authorize sanction letter generation.
                </label>
              </div>
              <Button onClick={acceptKFS} disabled={!kfsAccepted} className="w-full">Accept and Sanction</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Input Area */}
      {!showKFS && !selectedLoan && (
        <div className="p-3 border-t border-border/50 flex items-center space-x-2 bg-background">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept="image/*,application/pdf"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-primary rounded-full"
          >
            <Paperclip size={18} />
          </Button>
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type a message or attach a doc..." 
            className="flex-1 bg-muted/30 border-0 focus-visible:ring-1"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button size="icon" onClick={() => sendMessage()} className="rounded-full shadow-lg shadow-primary/20">
            <Send size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
