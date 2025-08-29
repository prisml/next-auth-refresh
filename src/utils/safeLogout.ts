import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/auth';

// NOTE: navigate 함수는 next/navigation 또는 next/router 사용 시 교체
export async function safeLogout(redirect: string = '/?reason=logged_out') {
    try {
        await queryClient.cancelQueries();
    } finally {
        useAuthStore.getState().clear();
        queryClient.removeQueries({ queryKey: ['/me'] });
        if (typeof window !== 'undefined') {
            window.location.replace(redirect);
        }
    }
}
