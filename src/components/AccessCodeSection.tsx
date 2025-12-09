// ============================================
// APP: NVA (React App)
// FILE: src/components/AccessCodeSection.tsx
// PURPOSE: Display access code with email verification
// ============================================

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Key,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Home,
  Clock,
  Loader2
} from 'lucide-react';
import { fetchAccessCode, AccessCodeApartment } from '../lib/guestApi';

interface AccessCodeSectionProps {
  token: string;
  checkInCompleted: boolean;
}

const AccessCodeSection: React.FC<AccessCodeSectionProps> = ({
  token,
  checkInCompleted
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [accessData, setAccessData] = useState<{
    accessCode: string;
    apartmentName: string;
    validFrom: string;
    validUntil: string;
    isGroupBooking?: boolean;
    apartments?: AccessCodeApartment[];
  } | null>(null);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchAccessCode(token, email.trim().toLowerCase());

      if (result.success) {
        setAccessData({
          accessCode: result.accessCode!,
          apartmentName: result.apartmentName!,
          validFrom: result.validFrom!,
          validUntil: result.validUntil!,
          isGroupBooking: result.isGroupBooking,
          apartments: result.apartments
        });
        setShowCode(true);
      } else {
        if (result.error === 'Email does not match booking') {
          setError('Email does not match the booking. Please use the email used for the reservation.');
        } else if (result.error === 'Online check-in not completed yet') {
          setError('Online check-in has not been completed yet. Please complete the check-in first.');
        } else {
          setError(result.error || 'Unable to retrieve access code');
        }
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Not available if check-in not completed
  if (!checkInCompleted) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Key className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-800 dark:text-yellow-300 font-medium">
              Access Code
            </p>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
              The access code will be available after completing the online check-in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show code after verification
  if (showCode && accessData) {
    const apartments = accessData.isGroupBooking && accessData.apartments
      ? accessData.apartments
      : [{
          apartmentName: accessData.apartmentName,
          accessCode: accessData.accessCode,
          validFrom: accessData.validFrom,
          validUntil: accessData.validUntil
        }];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Email verified!</span>
        </div>

        {apartments.map((apt, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 border border-blue-200 dark:border-blue-700 rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-900 dark:text-blue-300">
                {apt.apartmentName}
              </span>
            </div>

            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Your Access Code
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner">
                <div className="flex justify-center gap-2">
                  {apt.accessCode.split('').map((digit, i) => (
                    <span
                      key={i}
                      className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 px-3 py-2 rounded-lg"
                    >
                      {digit}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>
                Valid: {formatDateTime(apt.validFrom)} - {formatDateTime(apt.validUntil)}
              </span>
            </div>
          </div>
        ))}

        <Button
          onClick={() => {
            setShowCode(false);
            setAccessData(null);
            setEmail('');
          }}
          variant="outline"
          className="w-full"
        >
          <EyeOff className="mr-2 h-4 w-4" />
          Hide Code
        </Button>
      </div>
    );
  }

  // Email verification form
  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <span className="font-semibold text-gray-900 dark:text-white">
          Access Code
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        For security, enter your booking email to view the access code:
      </p>

      <form onSubmit={handleVerifyEmail} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="your@email.com"
            className="pl-10"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              View Access Code
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default AccessCodeSection;
