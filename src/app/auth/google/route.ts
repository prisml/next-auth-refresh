import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createSession, buildAccessTokenPayload } from '../../internal/session';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const idToken = body.idToken as string | undefined;
    if (!idToken) {
      return NextResponse.json({ message: 'idToken required' }, { status: 400 });
    }
    // (실제라면 idToken 검증) 여기서는 아무 값이나 허용
    const userId = 'user-' + idToken.slice(0, 6);
    const { refreshToken, accessToken, accessExpiresAt } = createSession(userId);

    const res = NextResponse.json({
      accessToken,
      accessExpiresAt,
      user: buildAccessTokenPayload(userId)
    });
    // HttpOnly refreshToken 쿠키 설정
    res.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 7일
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ message: 'internal error', error: e?.message }, { status: 500 });
  }
}
