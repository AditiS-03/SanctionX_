'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Application {
  id: string
  name: string
  email: string
  income: number
  fraudFlag: boolean
  status: 'pending' | 'approved' | 'rejected'
  docsVerified: boolean
  riskReview: 'low' | 'medium' | 'high' | 'pending'
}

export default function AdminPage() {
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && userProfile) {
      // Check if user is admin (you can add role-based check here)
      loadApplications()
    }
  }, [user, userProfile])

  const loadApplications = async () => {
    try {
      setLoading(true)
      // Mock data - in production, fetch from Firestore
      const mockApplications: Application[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          income: 75000,
          fraudFlag: false,
          status: 'pending',
          docsVerified: true,
          riskReview: 'low',
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          income: 120000,
          fraudFlag: false,
          status: 'pending',
          docsVerified: true,
          riskReview: 'low',
        },
        {
          id: '3',
          name: 'Alex Kumar',
          email: 'alex@example.com',
          income: 45000,
          fraudFlag: true,
          status: 'pending',
          docsVerified: false,
          riskReview: 'high',
        },
        {
          id: '4',
          name: 'Priya Sharma',
          email: 'priya@example.com',
          income: 95000,
          fraudFlag: false,
          status: 'approved',
          docsVerified: true,
          riskReview: 'low',
        },
      ]
      setApplications(mockApplications)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = (id: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: 'approved' } : app
      )
    )
  }

  const handleReject = (id: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: 'rejected' } : app
      )
    )
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-400'
      case 'medium':
        return 'text-yellow-400'
      case 'high':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-1 text-green-400">
            <CheckCircle className="h-4 w-4" />
            Approved
          </div>
        )
      case 'rejected':
        return (
          <div className="flex items-center gap-1 text-red-400">
            <XCircle className="h-4 w-4" />
            Rejected
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1 text-blue-400">
            <AlertCircle className="h-4 w-4" />
            Pending
          </div>
        )
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="text-slate-400 hover:text-slate-300 text-sm flex items-center gap-1 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Manage loan applications</p>
          </div>
          <div className="text-right">
            <p className="text-slate-300 text-sm">Total Applications: {applications.length}</p>
            <p className="text-slate-300 text-sm">
              Pending:{' '}
              <span className="text-blue-400 font-semibold">
                {applications.filter((a) => a.status === 'pending').length}
              </span>
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-900/30 border-red-600 text-red-100">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : (
          <Card className="border-slate-700 bg-slate-800 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800">
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Monthly Income</TableHead>
                    <TableHead className="text-slate-300">Docs</TableHead>
                    <TableHead className="text-slate-300">Fraud Flag</TableHead>
                    <TableHead className="text-slate-300">Risk</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="text-slate-200 font-medium">{app.name}</TableCell>
                      <TableCell className="text-slate-200 text-sm">{app.email}</TableCell>
                      <TableCell className="text-slate-200">₹{app.income.toLocaleString()}</TableCell>
                      <TableCell>
                        {app.docsVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        {app.fraudFlag ? (
                          <div className="flex items-center gap-1 text-red-400">
                            <AlertCircle className="h-4 w-4" />
                            Yes
                          </div>
                        ) : (
                          <span className="text-green-400">✓</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getRiskColor(app.riskReview)}`}>
                          {app.riskReview.charAt(0).toUpperCase() + app.riskReview.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="space-x-2">
                        {app.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleApprove(app.id)}
                              className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(app.id)}
                              className="h-8 bg-red-600 hover:bg-red-700 text-white text-xs"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Approved</p>
                <p className="text-2xl font-bold text-green-400">
                  {applications.filter((a) => a.status === 'approved').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Rejected</p>
                <p className="text-2xl font-bold text-red-400">
                  {applications.filter((a) => a.status === 'rejected').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Fraud Flags</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {applications.filter((a) => a.fraudFlag).length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Avg Income</p>
                <p className="text-2xl font-bold text-blue-400">
                  ₹{Math.round(applications.reduce((sum, a) => sum + a.income, 0) / applications.length).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
