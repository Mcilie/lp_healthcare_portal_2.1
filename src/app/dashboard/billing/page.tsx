'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bill } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useUser } from '@/hooks/use-user'

export default function Billing() {
  const [bills, setBills] = useState<Bill[]>([])
  const { user, loading } = useUser()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return;

    const fetchBills = async () => {
      try {
        const response = await fetch('/api/billing');
        
        if (response.status === 401) {
          // User is not authenticated, let the useUser hook handle redirection
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch billing data');
        }
        
        const data = await response.json();
        setBills(data);
      } catch (err) {
        console.error('Error fetching billing data:', err);
        setError('Failed to load billing information. Please try again later.');
      }
    }

    fetchBills();
  }, [loading]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Loading billing information...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Billing</h1>
        {error && (
          <div className="p-4 text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        {!error && bills.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p>No billing information found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bills.map(bill => (
              <Card key={bill.id}>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">{bill.provider}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Purpose</p>
                      <p>{bill.purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p>${parseFloat(String(bill.amount)).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className={bill.paid ? 'text-green-500' : 'text-red-500'}>
                        {bill.paid ? 'Paid' : 'Unpaid'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p>{new Date(bill.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 