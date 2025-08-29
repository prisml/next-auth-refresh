## 로그인 토큰 설계 실험

Next.js(App Router) + React Query + Zustand + Axios 로 액세스/리프레시 토큰 흐름을 검증하는 실험 프로젝트.

### 기능 개요
| 기능 | 설명 |
|------|------|
| accessToken 저장 | 메모리(Zustand) 저장 (XSS 노출 최소화) |
| refresh | accessToken 없거나 401 응답 시 1회 자동 재시도 (중복 호출 dedupe) |
| /auth/google | idToken 교환 → accessToken 수신 후 /me invalidate |
| /me 캐싱 | React Query stale/gc 시간 분리 관리 |
| safeLogout | 강제/수동 로그아웃 공통 정리 절차 (쿼리 cancel/remove + store clear + redirect) |
| Toast dedupe | 동일 에러 반복 노출 방지 |

### 폴더 구조 (발췌)
```
src/
	app/
		page.tsx          # 데모 홈 (로그인/로그아웃 UI)
		protected/        # 보호 페이지
	components/         # AuthProvider, ProtectedRoute 등
	services/http.ts    # axios 인스턴스 & 인터셉터
	stores/auth.ts      # accessToken 상태
	utils/safeLogout.ts # 통합 로그아웃 유틸
	lib/queryClient.ts  # React Query 설정
```

### 실행
설치:
```
npm install
```
개발:
```
npm run dev
```
프로덕션 빌드 & 실행:
```
npm run build
npm start
```

환경 변수 예시 (`.env.local`):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### API 계약 (가정)
- POST /auth/google { idToken } => { accessToken }
- POST /auth/refresh => { accessToken } (쿠키 기반 refreshToken 검증)
- GET /me => 사용자 정보 (401 시 재로그인 필요)
- POST /auth/logout => refreshToken 무효화

### 인터셉터 흐름
1. 요청 직전 accessToken 없으면 refresh 1회 시도
2. 401 응답: (재시도 안 한 경우) refresh → 성공 시 원 요청 재시도
3. 401 재실패 또는 refresh 실패: safeLogout + 세션 만료 토스트
4. 403: safeLogout + 권한 없음 토스트
5. 500: 서버 오류 토스트

### safeLogout 절차
1. queryClient.cancelQueries()
2. accessToken 초기화
3. /me 캐시 제거
4. redirect (location.replace)

### 향후 확장 (TODO)
- Google OAuth 실제 버튼/팝업 연동
- 역할/권한 기반 Guard (RequireRole)
- accessToken exp 디코딩 후 남은 시간 기반 staleTime 조절
- SSE/WebSocket 과의 연계 (토큰 갱신 시 스트림 재연결)
- 통합 성능 비교: (인터셉터 vs 명시적 fetch wrapper)

### 라이선스
MIT (원하면 추가 라이선스 파일 생성)
