import { NextResponse } from 'next/server';
import { destroySessionByRefresh } from '../../_lib/session';

export async function POST(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const match = /(?:^|; )refreshToken=([^;]+)/.exec(cookie);
  if (match) destroySessionByRefresh(decodeURIComponent(match[1]));
  const res = NextResponse.json({ ok: true });
  res.cookies.set('refreshToken', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
