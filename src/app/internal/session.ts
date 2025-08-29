import { randomUUID } from 'crypto';

interface Session {
  userId: string;
  refreshToken: string;
  accessToken: string;
  accessExpiresAt: number; // epoch ms
}

// In-memory stores (개발용)
const sessionsByRefresh = new Map<string, Session>();
const sessionsByAccess = new Map<string, Session>();

// Access 토큰 수명 (짧게 두어 refresh 시나리오 쉽게 재현)
const ACCESS_TTL_MS = 1000 * 60 * 2; // 2분

export function buildAccessTokenPayload(userId: string) {
  return { id: userId, email: userId + '@example.com', name: 'User ' + userId.slice(-4) };
}

export function createSession(userId: string) {
  // 기존 refresh 있으면 제거 (단일 세션 가정)
  for (const [r, s] of sessionsByRefresh) {
    if (s.userId === userId) {
      sessionsByRefresh.delete(r);
      sessionsByAccess.delete(s.accessToken);
    }
  }
  const refreshToken = randomUUID();
  const accessToken = randomUUID();
  const accessExpiresAt = Date.now() + ACCESS_TTL_MS;
  const session: Session = { userId, refreshToken, accessToken, accessExpiresAt };
  sessionsByRefresh.set(refreshToken, session);
  sessionsByAccess.set(accessToken, session);
  return { refreshToken, accessToken, accessExpiresAt };
}

export function rotateAccessTokenFromRefresh(refreshToken: string) {
  const session = sessionsByRefresh.get(refreshToken);
  if (!session) return null;
  // 새 access 발급
  sessionsByAccess.delete(session.accessToken);
  session.accessToken = randomUUID();
  session.accessExpiresAt = Date.now() + ACCESS_TTL_MS;
  sessionsByAccess.set(session.accessToken, session);
  return {
    accessToken: session.accessToken,
    accessExpiresAt: session.accessExpiresAt,
    user: buildAccessTokenPayload(session.userId)
  };
}

export function getUserByAccessToken(accessToken: string) {
  const session = sessionsByAccess.get(accessToken);
  if (!session) return null;
  if (Date.now() > session.accessExpiresAt) {
    // 만료 → 제거
    sessionsByAccess.delete(accessToken);
    return null;
  }
  return buildAccessTokenPayload(session.userId);
}

export function destroySessionByRefresh(refreshToken: string) {
  const session = sessionsByRefresh.get(refreshToken);
  if (!session) return;
  sessionsByRefresh.delete(refreshToken);
  sessionsByAccess.delete(session.accessToken);
}
