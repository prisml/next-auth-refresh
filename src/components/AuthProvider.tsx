'use client';
import React, { useEffect } from 'react';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import {
    queryClient,
    STALE_TIME_ACCESS_TOKEN_MS,
    CACHE_TIME_ACCESS_TOKEN_MS,
} from '@/lib/queryClient';
import { fetchMe } from '@/services/http';
import { useAuthStore } from '@/stores/auth';

interface Props {
    children: React.ReactNode;
}

function MeInitializer() {
    const accessToken = useAuthStore((s) => s.accessToken);
    useQuery({
        queryKey: ['/me'],
        queryFn: fetchMe,
        enabled: true,
        staleTime: STALE_TIME_ACCESS_TOKEN_MS,
        gcTime: CACHE_TIME_ACCESS_TOKEN_MS,
    });
    // accessToken이 있는데 /me 캐시가 없을 상황 거의 없지만 동기화 로직 예시
    useEffect(() => {
        // noop (필요 시 추가 동기화 로직)
    }, [accessToken]);
    return null;
}

export function AuthProvider({ children }: Props) {
    return (
        <QueryClientProvider client={queryClient}>
            <MeInitializer />
            {children}
        </QueryClientProvider>
    );
}
