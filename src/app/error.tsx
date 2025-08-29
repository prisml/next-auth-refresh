'use client';
import React from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div style={{ padding: 32 }}>
            <h2>오류가 발생했습니다.</h2>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#eee', padding: 12 }}>
                {error.message}
            </pre>
            <button onClick={() => reset()}>다시 시도</button>
        </div>
    );
}
