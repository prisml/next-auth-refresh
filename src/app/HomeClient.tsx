'use client';
import React from 'react';
import { exchangeGoogleIdToken, logoutRequest } from '@/services/http';

export function HomeClient() {
    async function handleGoogleLogin() {
        const fakeIdToken = 'FAKE_ID_TOKEN';
        await exchangeGoogleIdToken(fakeIdToken);
    }
    return (
        <div>
            <button onClick={handleGoogleLogin}>Google 로그인</button>
            <button onClick={() => logoutRequest()}>로그아웃</button>
        </div>
    );
}
