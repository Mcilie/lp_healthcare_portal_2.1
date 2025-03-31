import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, FlaskConical, Pill, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Welcome Back</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/billing" className="transition-transform hover:scale-[1.02]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Recent Bills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Access your latest bills and invoices.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/lab-results" className="transition-transform hover:scale-[1.02]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Latest Lab Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Access your latest lab results and test results.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/prescriptions" className="transition-transform hover:scale-[1.02]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Active Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
            <p>Access your latest prescriptions and refill requests.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/chat" className="transition-transform hover:scale-[1.02]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Health Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Have questions? Chat with our AI health assistant.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </DashboardLayout>
  )
} 