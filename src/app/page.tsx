'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMe, exchangeGoogleIdToken, logoutRequest } from '@/services/http';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';

export default function Home() {
    const {
        data: me,
        isLoading,
        refetch,
    } = useQuery({ queryKey: ['/me'], queryFn: fetchMe, retry: 0 });
    const accessToken = useAuthStore((s) => s.accessToken);
    const [idTokenInput, setIdTokenInput] = useState('');
    const [loginPending, setLoginPending] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function handleLogin() {
        setErrorMsg(null);
        setLoginPending(true);
        try {
            if (!idTokenInput.trim()) {
                setErrorMsg('idToken 입력 필요');
                return;
            }
            await exchangeGoogleIdToken(idTokenInput.trim());
            await refetch();
        } catch (e: any) {
            setErrorMsg(e?.message || '로그인 실패');
        } finally {
            setLoginPending(false);
        }
    }

    async function handleLogout() {
        await logoutRequest();
    }

    return (
        <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif', lineHeight: 1.5 }}>
            <h1>Auth Demo</h1>
            <section style={{ marginBottom: 28 }}>
                <h2>현재 세션</h2>
                {isLoading && <div>/me 불러오는 중...</div>}
                {!isLoading && !me && <div>로그인 안 됨</div>}
                {me && (
                    <pre
                        style={{
                            background: '#111',
                            color: '#0f0',
                            padding: 12,
                            borderRadius: 6,
                            maxWidth: 480,
                            overflowX: 'auto',
                        }}
                    >
                        {JSON.stringify(me, null, 2)}
                    </pre>
                )}
                <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
                    accessToken in store: {accessToken ? '있음' : '없음'}
                </div>
            </section>

            <section style={{ marginBottom: 28 }}>
                <h2>로그인 (Google idToken 교환)</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input
                        value={idTokenInput}
                        onChange={(e) => setIdTokenInput(e.target.value)}
                        placeholder="Google idToken 입력"
                        style={{
                            padding: '6px 10px',
                            minWidth: 260,
                            border: '1px solid #ccc',
                            borderRadius: 4,
                        }}
                    />
                    <button
                        onClick={handleLogin}
                        disabled={loginPending}
                        style={{
                            padding: '8px 16px',
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                        }}
                    >
                        {loginPending ? '로그인 중...' : '로그인'}
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '8px 16px',
                            background: '#444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                        }}
                    >
                        로그아웃
                    </button>
                </div>
                {errorMsg && <div style={{ marginTop: 8, color: 'crimson' }}>{errorMsg}</div>}
                <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    실제 Google 로그인 UI 미구현 상태: 발급받은 idToken 을 입력 후 로그인 테스트.
                </p>
            </section>

            <section>
                <h2>보호 페이지</h2>
                <Link href="/protected" style={{ color: '#2563eb' }}>
                    {' '}
                    /protected 이동{' '}
                </Link>
            </section>
        </main>
    );
}
