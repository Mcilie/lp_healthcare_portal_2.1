'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Heart, ClipboardList, Clock } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Heart className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">Liberty Health</span>
            </div>
            <div className="hidden sm:flex sm:space-x-8">
              <a href="#services" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md">Services</a>
              <a href="#about" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md">About</a>
              <a href="#contact" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md">Contact</a>
            </div>
            <div>
              <Link href="/login">
                <Button>Patient Portal</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Your Health, Our Priority
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Experience personalized care with Liberty Health's comprehensive healthcare solutions. Access your medical records, schedule appointments, and connect with healthcare providers seamlessly.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto">Access Patient Portal</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto text-primary" />
                <h3 className="mt-4 text-lg font-medium">Secure Access</h3>
                <p className="mt-2 text-gray-500">HIPAA-compliant security protecting your medical data</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-primary" />
                <h3 className="mt-4 text-lg font-medium">Digital Records</h3>
                <p className="mt-2 text-gray-500">Access your complete medical history anytime</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto text-primary" />
                <h3 className="mt-4 text-lg font-medium">24/7 Access</h3>
                <p className="mt-2 text-gray-500">Round-the-clock access to your personal healthcare information</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 mx-auto text-primary" />
                <h3 className="mt-4 text-lg font-medium">Preventive Care</h3>
                <p className="mt-2 text-gray-500">Proactive health monitoring and recommendations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Patients Say</h2>
          <div className="max-w-3xl mx-auto">
            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-3xl">🗝</span>
                    </div>
                  </div>
                  <blockquote className="text-xl italic text-gray-900 mb-4">
                    "We hold these truths to be self-evident: that all patients deserve excellent healthcare. Liberty Health has been taking care of the Founding Fathers since before it was constitutionally cool!"
                  </blockquote>
                  <cite className="text-gray-600 font-medium">
                    - Benjamin Franklin
                    <span className="block text-sm mt-1">Founding Father & Proud Patient Since 1706</span>
                  </cite>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">© 2025 Liberty Health. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
