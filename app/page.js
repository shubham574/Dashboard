'use client'

import { useUser } from '@clerk/nextjs';
import { useRouter } from "next/navigation";
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-6xl font-bold text-center text-primary mb-8">
        Employee Management
      </h1>
      <p className="text-xl text-gray-600 mb-8 text-center max-w-2xl">
        Streamline your team management with our comprehensive dashboard for meetings, forms, and attendance tracking.
      </p>
      <div className="flex space-x-4">
        <Link href="/sign-in" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
          Sign In
        </Link>
        <Link href="/sign-up" className="border border-primary text-primary px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
          Sign Up
        </Link>
      </div>
    </div>
  );
}