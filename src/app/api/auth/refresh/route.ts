import { NextResponse } from 'next/server';
import { rotateAccessTokenFromRefresh } from '../../_lib/session';

export async function POST(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const match = /(?:^|; )refreshToken=([^;]+)/.exec(cookie);
  if (!match) {
    return NextResponse.json({ message: 'no refresh token' }, { status: 401 });
  }
  const refreshToken = decodeURIComponent(match[1]);
  const rotated = rotateAccessTokenFromRefresh(refreshToken);
  if (!rotated) {
    return NextResponse.json({ message: 'invalid refresh' }, { status: 401 });
  }
  const { accessToken, accessExpiresAt, user } = rotated;
  return NextResponse.json({ accessToken, accessExpiresAt, user });
}
