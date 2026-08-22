
"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Loader2, CheckCircle, XCircle, Eye, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AdminApplications() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('loan_applications')
            .select('*, user_profiles(full_name, email)')
            .order('created_at', { ascending: false });

        if (!error) setApplications(data || []);
        setLoading(false);
    };

    const updateStatus = async (id: string, status: string) => {
        const { error } = await supabase
            .from('loan_applications')
            .update({ status })
            .eq('id', id);

        if (!error) fetchApplications();
    };

    const filtered = applications.filter(app => 
        app.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-muted/30 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                            <ShieldCheck className="text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">Loan Officer Panel</h1>
                            <p className="text-muted-foreground text-sm">Review and manage incoming loan applications</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardDescription>Total Applications</CardDescription>
                            <CardTitle className="text-3xl">{applications.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-yellow-700">Pending Review</CardDescription>
                            <CardTitle className="text-3xl text-yellow-800">
                                {applications.filter(a => a.status === 'Applied' || a.status === 'Pending').length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-green-700">Approved Today</CardDescription>
                            <CardTitle className="text-3xl text-green-800">0</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card className="shadow-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg">Applications Queue</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by name or ID..." 
                                    className="pl-9 h-9" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" className="h-9 w-9">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Applicant</TableHead>
                                        <TableHead>Amount Requested</TableHead>
                                        <TableHead>Requested On</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No applications found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        filtered.map((app) => (
                                            <TableRow key={app.id}>
                                                <TableCell>
                                                    <div className="font-medium">{app.user_profiles?.full_name}</div>
                                                    <div className="text-xs text-muted-foreground">{app.user_profiles?.email}</div>
                                                </TableCell>
                                                <TableCell className="font-bold text-base">₹{app.amount?.toLocaleString()}</TableCell>
                                                <TableCell className="text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        app.status === 'Approved' ? 'default' : 
                                                        app.status === 'Rejected' ? 'destructive' : 'secondary'
                                                    }>
                                                        {app.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" title="Details">
                                                            <Eye size={16} />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" size="icon" className="h-8 w-8 text-green-600" 
                                                            onClick={() => updateStatus(app.id, 'Approved')}
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" size="icon" className="h-8 w-8 text-destructive" 
                                                            onClick={() => updateStatus(app.id, 'Rejected')}
                                                            title="Reject"
                                                        >
                                                            <XCircle size={16} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
