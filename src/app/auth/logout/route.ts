import { NextResponse } from 'next/server';
import { destroySessionByRefresh } from '../../internal/session';

export async function POST(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const match = /(?:^|; )refreshToken=([^;]+)/.exec(cookie);
  if (match) {
    destroySessionByRefresh(decodeURIComponent(match[1]));
  }
  const res = NextResponse.json({ ok: true });
  // 쿠키 제거
  res.cookies.set('refreshToken', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
