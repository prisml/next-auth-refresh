import { QueryClient } from '@tanstack/react-query';

export const STALE_TIME_ACCESS_TOKEN_MS = 1000 * 60 * 4; // 예: 4분 (만료 5분 전 갱신 가정)
export const CACHE_TIME_ACCESS_TOKEN_MS = 1000 * 60 * 5; // 예: 5분

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            staleTime: 0,
        },
    },
});
