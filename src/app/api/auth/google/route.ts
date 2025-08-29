import { NextResponse } from 'next/server';
import { createSession, buildAccessTokenPayload } from '../../_lib/session';

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const idToken = body.idToken as string | undefined;
        if (!idToken) {
            return NextResponse.json({ message: 'idToken required' }, { status: 400 });
        }
        const userId = 'user-' + idToken.slice(0, 6);
        const { refreshToken, accessToken, accessExpiresAt } = createSession(userId);
        const res = NextResponse.json({
            accessToken,
            accessExpiresAt,
            user: buildAccessTokenPayload(userId),
        });
        res.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7,
        });
        return res;
    } catch (e: any) {
        return NextResponse.json({ message: 'internal error', error: e?.message }, { status: 500 });
    }
}
