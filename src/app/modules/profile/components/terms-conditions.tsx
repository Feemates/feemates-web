'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Users, CreditCard, Shield, AlertTriangle } from 'lucide-react';

export function TermsConditions() {
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
            <h1 className="text-xl font-bold text-gray-900">Terms & Conditions</h1>
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
                <FileText className="mr-2 h-5 w-5" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-gray-600">
                By using Feemates, you agree to be bound by these Terms and Conditions. Please read
                them carefully before using our subscription sharing platform. If you do not agree
                to these terms, please do not use our services.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <Users className="mr-2 h-5 w-5" />
                Service Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-relaxed text-gray-600">
                Feemates is a platform that enables users to share subscription costs with friends,
                family, or other users. Our service includes:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Creating and managing shared subscriptions</li>
                <li>• Processing payments between users</li>
                <li>• Facilitating communication between subscription members</li>
                <li>• Providing tools for expense tracking and management</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <Shield className="mr-2 h-5 w-5" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 leading-relaxed text-gray-600">
                As a user of Feemates, you agree to:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Provide accurate and truthful information</li>
                <li>• Make payments on time as agreed</li>
                <li>• Respect other users and maintain appropriate conduct</li>
                <li>• Only share subscriptions you legally own or have permission to share</li>
                <li>• Comply with the terms of service of third-party subscription providers</li>
                <li>• Keep your account information secure and confidential</li>
                <li>• Report any suspicious or fraudulent activity</li>
              </ul>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 font-medium text-gray-900">Payment Processing</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Payments are processed securely through our verified payment partners</li>
                  <li>• Bank account verification is required for payment processing</li>
                  <li>• Payment schedules are determined by subscription billing cycles</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-medium text-gray-900">Fees and Charges</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Feemates charges a small service fee for payment processing</li>
                  <li>• Late payment fees may apply for overdue payments</li>
                  <li>• Currency conversion fees may apply for international transactions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Activities */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 leading-relaxed text-gray-600">
                The following activities are strictly prohibited:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Sharing accounts without proper authorization</li>
                <li>• Using the platform for illegal or fraudulent purposes</li>
                <li>• Attempting to circumvent payment obligations</li>
                <li>• Harassing or threatening other users</li>
                <li>• Creating multiple accounts to avoid fees or restrictions</li>
                <li>• Reverse engineering or attempting to hack the platform</li>
                <li>• Violating intellectual property rights</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-gray-600">
                Feemates provides the platform &quot;as is&quot; and makes no warranties about the
                availability, reliability, or functionality of third-party subscription services. We
                are not responsible for disputes between users, service interruptions by
                subscription providers, or any indirect damages arising from platform use.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h3 className="mb-2 font-medium text-blue-900">Questions About These Terms?</h3>
              <p className="mb-3 text-sm text-blue-800">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="space-y-1 text-sm text-blue-800">
                <p>Email: legal@feemates.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Legal St, Terms City, TC 12345</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
