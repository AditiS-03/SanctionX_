
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Mail, Lock, Loader2, ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Admin Login logic
        if (userRole === 'admin') {
            if (email === "aditi.33.singhid@gmail.com" && password === "123456") {
                await new Promise(resolve => setTimeout(resolve, 800)); // Smooth transition
                setLoading(false);
                router.push('/admin');
                return;
            } else {
                setLoading(false);
                setError('Invalid Admin Credentials');
                return;
            }
        }

        try {
            // @ts-ignore - Supabase client types might be mismatched in this environment
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            router.push('/profile');
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 relative">
            <div className="absolute top-8 right-8">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-2">
                        Back to Home
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left: Login Card */}
                <Card className="shadow-xl">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <Shield className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold">SanctionX</span>
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            {userRole === 'admin' ? 'Admin Access' : 'Welcome back'}
                        </CardTitle>
                        <CardDescription>
                            {userRole === 'admin' 
                                ? 'Secure portal for loan officers' 
                                : 'Login to manage your loan applications'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Role Switcher Tabs */}
                        <div className="flex p-1 bg-muted rounded-lg mb-6 border border-border/50">
                            <button 
                                onClick={() => setUserRole('user')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${userRole === 'user' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                User Access
                            </button>
                            <button 
                                onClick={() => setUserRole('admin')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${userRole === 'admin' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Admin Access
                            </button>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        type="email" 
                                        placeholder={userRole === 'admin' ? "admin@sanctionx.com" : "name@example.com"} 
                                        className="pl-10" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        type="password" 
                                        className="pl-10" 
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button className="w-full" type="submit" disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {userRole === 'admin' ? 'Login as Admin' : 'Login to Dashboard'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Right: Signup Block */}
                <div className="flex flex-col justify-center space-y-6 p-4">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">New to SanctionX?</h2>
                        <p className="text-muted-foreground">
                            Start your instant loan journey today. It takes less than 5 minutes to get your first sanction letter.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <ArrowRight className="h-3 w-3 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Instant Eligibility Check</p>
                                <p className="text-xs text-muted-foreground">AI-powered analysis based on your profile.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <ArrowRight className="h-3 w-3 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Paperless KYC</p>
                                <p className="text-xs text-muted-foreground">Secure Aadhaar and PAN verification.</p>
                            </div>
                        </div>
                    </div>

                    <Link href="/signup">
                        <Button variant="outline" size="lg" className="w-full mt-4 group border-2 border-primary/20 hover:border-primary/50 transition-all">
                            <UserPlus className="mr-2 h-5 w-5 text-primary" />
                            Create New Application
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                    
                    <p className="text-xs text-center text-muted-foreground">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
