import './globals.css';
import React from 'react';
import { ClientProviders } from '@/components/ClientProviders';

export const metadata = { title: 'Login Token Demo' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <body>
                <ClientProviders>{children}</ClientProviders>
            </body>
        </html>
    );
}
