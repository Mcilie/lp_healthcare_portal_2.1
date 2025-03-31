'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Prescription } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useUser } from '@/hooks/use-user'

export default function Prescriptions() {
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const { user, loading } = useUser()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return;

    const fetchPrescriptions = async () => {
      try {
        const response = await fetch('/api/prescriptions');
        
        if (response.status === 401) {
          // User is not authenticated, let the useUser hook handle redirection
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch prescription data');
        }
        
        const data = await response.json();
        setPrescriptions(data);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError('Failed to load prescriptions. Please try again later.');
      }
    }

    fetchPrescriptions();
  }, [loading, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Loading prescriptions...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Prescriptions</h1>
        {error && (
          <div className="p-4 mb-4 text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        <div className="grid gap-4">
          {prescriptions.length === 0 && !error && (
            <Card>
              <CardContent className="p-6">
                <p>No prescriptions found.</p>
              </CardContent>
            </Card>
          )}
          {prescriptions.map((prescription) => (
            <Card key={prescription.id}>
              <CardHeader>
                <CardTitle>{prescription.drug}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">Dosage: {prescription.dosage}</p>
                <p className="text-sm mt-2">
                  Issued: {new Date(prescription.date_issued).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  Expires: {new Date(prescription.expiry_date).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
} 