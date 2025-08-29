'use client';
import React from 'react';
import { AuthProvider } from '@/components/AuthProvider';
import dynamic from 'next/dynamic';

const Toaster = dynamic(() => import('react-hot-toast').then((m) => m.Toaster), { ssr: false });

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            {children}
            <Toaster position="top-center" />
        </AuthProvider>
    );
}
