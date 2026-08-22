
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Loader2, Download, ChevronRight, Info, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const SESSION_ID = "demo-user"; // In production, this would be a real user ID
const BACKEND_URL = "http://127.0.0.1:8000";

interface Message {
  role: 'bot' | 'user';
  text: string;
}

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [loanOptions, setLoanOptions] = useState<any[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [showKFS, setShowKFS] = useState(false);
  const [kfsAccepted, setKfsAccepted] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startConversation();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: SESSION_ID, message: "hi" }),
      });
      const data = await res.json();
      setMessages([{ role: "bot", text: data.reply }]);
    } catch (e) {
      setMessages([{ role: "bot", text: "Connection error. Please ensure the backend is running." }]);
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

      if (data.reply === "MATCH_FOUND") {
        setMessages((m) => [...m, { role: "bot", text: "Great news! You are eligible for the following loan options. Please select one to proceed." }]);
        setLoanOptions([
          { amount: 500000, rate: 10.5, tenure: 12, emi: 44000, total: 528000 },
          { amount: 500000, rate: 11.2, tenure: 24, emi: 23000, total: 552000 },
          { amount: 500000, rate: 12.0, tenure: 36, emi: 16000, total: 576000 }
        ]);
      } else {
        setMessages((m) => [...m, { role: "bot", text: data.reply }]);
      }
    } catch (e) {
      setTyping(false);
      setMessages((m) => [...m, { role: "bot", text: "Oops! Something went wrong on our end." }]);
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

    // Simulate final approval and letter generation
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "bot", text: "🎉 Loan Sanctioned! Your application is now in 'Sanction Letter Generated' status. You can download your letter below." }]);
      setApplicationStatus([
        { label: "Docs Verified", status: "completed" },
        { label: "Risk Review", status: "completed" },
        { label: "Approved", status: "completed" },
        { label: "Letter Generated", status: "current" }
      ]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[500px] bg-background relative border-0">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
                m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none border border-border/50"
              }`}>
              {m.text}
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
          <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="text-muted-foreground">
            <Paperclip size={18} />
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" />
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Describe your loan purpose..." 
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
