"use client"

import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Heart, 
  CreditCard, 
  FlaskConical, 
  Pill, 
  MessageSquare,
  User,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Redirect to login page after successful logout
        router.push('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: Heart },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Lab Results', href: '/dashboard/lab-results', icon: FlaskConical },
    { name: 'Prescriptions', href: '/dashboard/prescriptions', icon: Pill },
    { name: 'Chat Assistant', href: '/dashboard/chat', icon: MessageSquare },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Heart className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">Liberty Health</span>
            </Link>
            <div className="flex items-center gap-4">
              <User className="h-5 w-5 text-gray-500" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout} 
                className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <Card className="p-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm rounded-md",
                      pathname === item.href 
                        ? "bg-primary text-primary-foreground" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </Card>
          </div>

          <div className="flex-1">
            <Card className="p-6">
              {children}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 