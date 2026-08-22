
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Bot, User, FileText, Settings, LogOut, LayoutDashboard, MessageSquare } from "lucide-react";
import { ChatWidget } from "@/components/chat-widget";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      // @ts-ignore
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    // @ts-ignore
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Bot className="animate-spin" /></div>;

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Mini Sidebar */}
      <aside className="w-64 bg-background border-r border-border/50 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-border/50">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">SX</span>
          </div>
          <span className="font-bold text-lg">SanctionX</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2 bg-muted">
            <LayoutDashboard size={18} /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <FileText size={18} /> Applications
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <MessageSquare size={18} /> Support
          </Button>
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User size={16} />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">{user.email}</p>
              <p className="text-[10px] text-muted-foreground">Borrower Account</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome, Borrower</h1>
              <p className="text-muted-foreground">Monitor your loan application and chat with our AI officer.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Stats & Status */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Personal Loan</p>
                      <p className="text-xs text-muted-foreground">Ref: SX-2026-9901</p>
                    </div>
                    <span className="ml-auto bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">In Progress</span>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                      <span>COMPLETION</span>
                      <span>65%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[65%]"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">PAN</p>
                    <p className="font-bold uppercase">******748F</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Aadhaar</p>
                    <p className="font-bold">**** **** 1234</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t">
                    <p className="text-muted-foreground">Estimated Eligibility</p>
                    <p className="text-xl font-bold text-primary">₹ 5,00,000</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Embedded Chat */}
            <div className="lg:col-span-2">
               <Card className="h-full flex flex-col overflow-hidden shadow-2xl border-primary/20">
                <CardHeader className="bg-primary/5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Bot className="text-primary-foreground h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-md">AI Loan Officer</CardTitle>
                      <CardDescription className="text-xs">Secure conversation regarding SX-2026-9901</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 border-0 flex-1">
                  <ChatWidget />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
