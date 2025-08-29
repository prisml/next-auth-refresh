import axios, { AxiosError, AxiosInstance } from 'axios';
import { useAuthStore } from '@/stores/auth';
import { safeLogout } from '@/utils/safeLogout';
import { queryClient } from '@/lib/queryClient';
import toast from 'react-hot-toast';

// 동일 Next.js 앱의 Route Handlers(mock API)를 사용하므로 baseURL 생략(상대경로) 가능
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// 중복 토스트 방지
let lastToastKey: string | null = null;
function showToastOnce(key: string, message: string) {
    if (lastToastKey === key) return;
    lastToastKey = key;
    toast.error(message, { id: key });
    setTimeout(() => {
        if (lastToastKey === key) lastToastKey = null;
    }, 2000);
}

// /api/auth/google 전용 인스턴스 (쿠키 불필요, body json)
export const googleAuthClient = axios.create({ baseURL: API_BASE_URL || undefined, headers: { 'Content-Type': 'application/json' } });

// /api/auth/refresh 전용 인스턴스 (쿠키 필요 withCredentials)
export const refreshClient = axios.create({ baseURL: API_BASE_URL || undefined, withCredentials: true, headers: { 'Content-Type': 'application/json' } });

// 일반 API 인스턴스
export const apiClient: AxiosInstance = axios.create({ baseURL: API_BASE_URL || undefined, withCredentials: true, headers: { 'Content-Type': 'application/json' } });

// refresh 진행 중 중복 호출 방지
let refreshPromise: Promise<string | null> | null = null;

async function requestRefresh(): Promise<string | null> {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            try {
            const res = await refreshClient.post('/api/auth/refresh');
                const newAccess = res.data?.accessToken as string | undefined;
                if (newAccess) {
                    useAuthStore.getState().setAccessToken(newAccess);
                    return newAccess;
                }
                return null;
            } catch (e) {
                return null;
            } finally {
                const p = refreshPromise;
                refreshPromise = null;
                return p ? await p : null; // ensure resolution
            }
        })();
    }
    return refreshPromise;
}

// 요청 인터셉터
apiClient.interceptors.request.use(async (config) => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
        // accessToken 없으면 refresh 시도
        const newToken = await requestRefresh();
        if (newToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${newToken}`;
        }
    } else {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 응답 인터셉터
apiClient.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
        const original = error.config as any & { _retry?: boolean };
        const status = error.response?.status;

        if (status === 401) {
            if (original && !original._retry) {
                original._retry = true;
                const newToken = await requestRefresh();
                if (newToken) {
                    original.headers = original.headers || {};
                    original.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(original); // 재시도
                }
            }
            showToastOnce('auth_401', '세션이 만료되었습니다. 다시 로그인 해주세요.');
            await safeLogout('/?reason=expired');
        } else if (status === 403) {
            showToastOnce('auth_403', '권한이 없습니다.');
            await safeLogout('/?reason=forbidden');
        } else if (status === 500) {
            showToastOnce('server_500', '서버 오류가 발생했습니다.');
        }

        return Promise.reject(error);
    }
);

// /me API 래퍼
export async function fetchMe() {
        const res = await apiClient.get('/api/me');
    return res.data;
}

// google auth 교환 함수
export async function exchangeGoogleIdToken(idToken: string) {
        const res = await googleAuthClient.post('/api/auth/google', { idToken });
    const accessToken = res.data?.accessToken as string | undefined;
    if (accessToken) {
        useAuthStore.getState().setAccessToken(accessToken);
        // /me invalidate -> 새로 가져오기
        queryClient.invalidateQueries({ queryKey: ['/me'] });
    }
    return res.data;
}

export async function logoutRequest() {
    try {
        await apiClient.post('/api/auth/logout');
    } finally {
        await safeLogout('/?reason=logged_out');
    }
}
