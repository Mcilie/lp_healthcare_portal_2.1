'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LabResult } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useUser } from '@/hooks/use-user'

export default function LabResults() {
  const router = useRouter()
  const [results, setResults] = useState<LabResult[]>([])
  const { user, loading } = useUser()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return;

    const fetchResults = async () => {
      try {
        const response = await fetch('/api/lab-results');
        
        if (response.status === 401) {
          // User is not authenticated, let the useUser hook handle redirection
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch lab results data');
        }
        
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error('Error fetching lab results:', err);
        setError('Failed to load lab results. Please try again later.');
      }
    }

    fetchResults();
  }, [loading, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Loading lab results...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Lab Results</h1>
        {error && (
          <div className="p-4 mb-4 text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        <div className="grid gap-4">
          {results.length === 0 && !error && (
            <Card>
              <CardContent className="p-6">
                <p>No lab results found.</p>
              </CardContent>
            </Card>
          )}
          {results.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <CardTitle>{result.condition}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">Date: {new Date(result.date).toLocaleDateString()}</p>
                <p className="text-lg mt-2">{result.diagnosis}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
} 