'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, CheckCircle, User, CreditCard, Building } from 'lucide-react';

const personalInfoSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }),
  dateOfBirth: z.string().min(1, {
    message: 'Date of birth is required.',
  }),
  phoneNumber: z.string().min(10, {
    message: 'Phone number must be at least 10 characters.',
  }),
});

const addressInfoSchema = z.object({
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }),
  city: z.string().min(2, {
    message: 'City must be at least 2 characters.',
  }),
  state: z.string().min(2, {
    message: 'State must be at least 2 characters.',
  }),
  zipCode: z.string().min(5, {
    message: 'ZIP code must be at least 5 characters.',
  }),
});

const bankAccountSchema = z.object({
  bankName: z.string().min(2, {
    message: 'Bank name is required.',
  }),
  accountHolderName: z.string().min(2, {
    message: 'Account holder name is required.',
  }),
  accountType: z.string().min(1, {
    message: 'Please select an account type.',
  }),
  routingNumber: z.string().length(9, {
    message: 'Routing number must be exactly 9 digits.',
  }),
  accountNumber: z.string().min(8, {
    message: 'Account number must be at least 8 characters.',
  }),
});

export function KycVerification() {
  const [currentStep, setCurrentStep] = useState(1);

  const personalForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phoneNumber: '',
    },
  });

  const addressForm = useForm<z.infer<typeof addressInfoSchema>>({
    resolver: zodResolver(addressInfoSchema),
    defaultValues: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  const bankForm = useForm<z.infer<typeof bankAccountSchema>>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bankName: '',
      accountHolderName: '',
      accountType: '',
      routingNumber: '',
      accountNumber: '',
    },
  });

  const handleBackClick = () => {
    window.location.href = '/dashboard';
  };

  const handleNextStep = async () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = await personalForm.trigger();
      if (isValid) setCurrentStep(2);
    } else if (currentStep === 2) {
      isValid = await addressForm.trigger();
      if (isValid) setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (values: z.infer<typeof bankAccountSchema>) => {
    const allData = {
      personal: personalForm.getValues(),
      address: addressForm.getValues(),
      bank: values,
    };
    console.log('Bank account verification submitted:', allData);
    alert(
      "Bank account verification submitted successfully! We'll send micro-deposits to your account within 1-2 business days for verification."
    );
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Bank Account Verification</h1>
            <p className="text-sm text-gray-500">Step {currentStep} of 3</p>
          </div>
        </div>
      </header>

      <div className="border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-1 items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
              </div>
              {step < 3 && (
                <div
                  className={`mx-2 h-1 flex-1 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <main className="px-4 py-6">
        {currentStep === 1 && (
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg font-semibold">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
              <p className="text-sm text-gray-500">
                Information must match your bank account records
              </p>
            </CardHeader>
            <CardContent>
              <Form {...personalForm}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={personalForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" className="h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" className="h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={personalForm.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Enter phone number"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg font-semibold">
                <CreditCard className="mr-2 h-5 w-5" />
                Address Information
              </CardTitle>
              <p className="text-sm text-gray-500">Address must match your bank account records</p>
            </CardHeader>
            <CardContent>
              <Form {...addressForm}>
                <div className="space-y-4">
                  <FormField
                    control={addressForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter street address" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addressForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" className="h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addressForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" className="h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={addressForm.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter ZIP code" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg font-semibold">
                <Building className="mr-2 h-5 w-5" />
                Bank Account Details
              </CardTitle>
              <p className="text-sm text-gray-500">
                Enter your bank account information for verification
              </p>
            </CardHeader>
            <CardContent>
              <Form {...bankForm}>
                <form onSubmit={bankForm.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={bankForm.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Chase Bank, Bank of America"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bankForm.control}
                    name="accountHolderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Name as it appears on account"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bankForm.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="checking">Checking Account</SelectItem>
                            <SelectItem value="savings">Savings Account</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bankForm.control}
                    name="routingNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Routing Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="9-digit routing number"
                            className="h-12"
                            maxLength={9}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bankForm.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account number" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex justify-between">
          <Button
            onClick={handlePrevStep}
            variant="outline"
            disabled={currentStep === 1}
            className="px-6"
          >
            Previous
          </Button>
          <Button
            onClick={currentStep === 3 ? bankForm.handleSubmit(handleSubmit) : handleNextStep}
            className="px-6"
          >
            {currentStep === 3 ? 'Submit for Verification' : 'Next'}
          </Button>
        </div>

        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h3 className="mb-2 font-medium text-blue-900">🔒 Secure Bank Account Verification</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Bank-grade security with encrypted data storage</li>
              <li>• Micro-deposits (under $1.00) will be sent to verify your account</li>
              <li>• Verification typically takes 1-2 business days</li>
              <li>• You&apos;ll confirm the deposit amounts to complete verification</li>
              <li>• Your bank details are never shared with other users</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
