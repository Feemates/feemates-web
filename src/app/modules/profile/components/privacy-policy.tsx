'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck } from 'lucide-react';

export function PrivacyPolicy() {
  const handleBackClick = () => {
    window.location.href = '/profile';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-sm text-gray-500">Last updated: March 2024</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        <div className="space-y-6">
          {/* Introduction */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <Shield className="mr-2 h-5 w-5" />
                Your Privacy Matters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-gray-600">
                At Feemates, we are committed to protecting your privacy and ensuring the security
                of your personal information. This Privacy Policy explains how we collect, use, and
                safeguard your data when you use our subscription sharing platform.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <Database className="mr-2 h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 font-medium text-gray-900">Personal Information</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Name, email address, and phone number</li>
                  <li>• Bank account information for payment processing</li>
                  <li>• Profile information and preferences</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-medium text-gray-900">Usage Information</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Subscription sharing activities</li>
                  <li>• Payment history and transaction records</li>
                  <li>• App usage patterns and preferences</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <Eye className="mr-2 h-5 w-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Process payments and manage subscriptions</li>
                <li>• Verify your identity and prevent fraud</li>
                <li>• Provide customer support and resolve issues</li>
                <li>• Send important updates about your account</li>
                <li>• Improve our services and user experience</li>
                <li>• Comply with legal and regulatory requirements</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <Lock className="mr-2 h-5 w-5" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 leading-relaxed text-gray-600">
                We implement industry-standard security measures to protect your personal
                information:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• End-to-end encryption for all sensitive data</li>
                <li>• Secure payment processing through certified providers</li>
                <li>• Regular security audits and monitoring</li>
                <li>• Limited access to personal information by authorized personnel only</li>
                <li>• Secure data storage with backup and recovery systems</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <UserCheck className="mr-2 h-5 w-5" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 leading-relaxed text-gray-600">
                You have the following rights regarding your personal information:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Access and review your personal data</li>
                <li>• Request corrections to inaccurate information</li>
                <li>• Delete your account and associated data</li>
                <li>• Export your data in a portable format</li>
                <li>• Opt-out of non-essential communications</li>
                <li>• Request information about data sharing practices</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h3 className="mb-2 font-medium text-blue-900">Questions About Privacy?</h3>
              <p className="mb-3 text-sm text-blue-800">
                If you have any questions about this Privacy Policy or how we handle your data,
                please contact us:
              </p>
              <div className="space-y-1 text-sm text-blue-800">
                <p>Email: privacy@feemates.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Privacy St, Security City, SC 12345</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
