"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { ChatWidget } from "@/components/chat-widget";
import { useAuth } from "@/lib/auth-context";

export function ChatbotEmbed() {
  const { user } = useAuth();
  
  return (
    <section id="chat-section" className="bg-muted/30 py-20 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Get Started
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 font-[family-name:var(--font-heading)]">
            Chat with SanctionX
          </h2>
          <p className="text-muted-foreground mt-3">
            Your AI-powered Digital Loan Officer
          </p>
        </div>

        <Card className="shadow-2xl border border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-5 px-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold font-[family-name:var(--font-heading)]">
                  SanctionX Chat
                </CardTitle>
                <span className="text-xs text-primary-foreground/80">
                  Online
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 border-0">
             <ChatWidget userId={user?.id} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
