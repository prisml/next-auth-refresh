'use client';
import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export function ProtectedPageClient() {
    return (
        <ProtectedRoute>
            <div>비밀 페이지</div>
        </ProtectedRoute>
    );
}
