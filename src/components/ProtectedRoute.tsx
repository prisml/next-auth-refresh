'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchMe } from '@/services/http';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback = null }: Props) {
    const { data, isLoading } = useQuery({ queryKey: ['/me'], queryFn: fetchMe });
    if (isLoading) return <>{fallback || <div>Loading...</div>}</>;
    if (!data) return <div>권한이 없습니다.</div>;
    return <>{children}</>;
}
