'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface ErrorWithMessage extends Error {
  message: string;
}

export default function Verify() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!email) {
      router.push('/auth/login');
    }
  }, [email, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!otp) {
      setError('Verification code is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }
      
      setSuccessMessage('Email verified successfully! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login?verified=true');
      }, 2000);
    } catch (err) {
      const error = err as ErrorWithMessage;
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: 'verification',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }
      
      setSuccessMessage(data.message);
    } catch (err) {
      const error = err as ErrorWithMessage;
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-center text-white">Verify Your Email</h1>
        <p className="text-gray-400 text-center mb-6">We need to verify your email address</p>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 rounded-md p-4 mb-6">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 rounded-md p-4 mb-6">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <p className="mb-2 text-sm text-gray-400">
              We&apos;ve sent a verification code to <span className="font-medium text-white">{email}</span>
            </p>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-300">
              Enter Verification Code
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-3 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              placeholder="123456"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-indigo-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
          
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-700">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isLoading}
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
            >
              Resend Code
            </button>
            
            <Link href="/auth/login" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 