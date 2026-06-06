markdown# 웹툰로그 프로젝트

## 서비스 개요
웹툰 감상 기록 서비스
- URL: webtoonlog.vercel.app
- GitHub: github.com/toonlog/webtoonlog
- 로컬: C:\Users\User\webtoonlog

## 기술 스택
- Next.js 16 (App Router, TypeScript)
- Airtable (DB)
- Vercel (호스팅)

## Airtable
- BASE ID: appaauqeF3Nr9QMn3
- 테이블: WEBTOON, USER, REVIEW, READING_STATUS, COLLECTION, COLLECTION_ITEM, FOLLOW

## 폴더 구조
app/
├── api/
│   ├── auth/
│   │   ├── login/route.js
│   │   ├── register/route.js
│   │   ├── update/route.js        ← 닉네임/프로필사진 변경
│   │   └── delete/route.js        ← 회원탈퇴
│   ├── collections/
│   │   ├── route.js               ← 컬렉션 CRUD (GET/POST/PATCH/DELETE)
│   │   └── items/route.js         ← preview=true 파라미터로 썸네일 4개
│   ├── follow/route.js
│   ├── genre/route.js             ← 장르별 웹툰 조회 (?name=BL)
│   ├── mypage/route.js            ← 내 리뷰/읽기상태 (썸네일 포함)
│   ├── reading-status/route.js
│   ├── reviews/route.js           ← tags, is_public, profileImage 포함
│   ├── tag/route.js               ← 유저태그별 웹툰 조회 (?name=순애)
│   ├── users/[id]/route.js        ← profile_image 포함
│   └── webtoons/
│       ├── route.js               ← genre 필드 포함 반환
│       ├── add/route.js
│       └── [id]/route.js
├── components/
│   ├── Carousel.tsx               ← 2초 자동, 모바일 스와이프
│   ├── FeedbackButton.tsx
│   └── Header.tsx                 ← 검색, 프로필사진, 로그아웃(PC만), 로고 클릭 active 피드백
├── lib/
│   ├── airtable.js
│   └── auth.js
├── genre/[name]/page.tsx          ← 클라이언트 컴포넌트, /api/genre 호출
├── tag/[name]/page.tsx            ← 클라이언트 컴포넌트, /api/tag 호출
├── collections/
│   ├── page.tsx                   ← 썸네일 2x2 그리드, PC 4열
│   └── [id]/page.tsx
├── login/page.tsx
├── mypage/page.tsx                ← StarPicker/StarDisplay, 이미지 저장/취소 모바일 줄바꿈 수정
├── users/[id]/page.tsx
├── webtoon/[id]/page.tsx          ← StarPicker/StarDisplay/WebtoonCollectionSection, 플랫폼 뱃지 클릭 비활성(span), 리뷰 헤더 별점+토글 인라인
├── add/page.tsx
└── page.tsx                       ← export const revalidate = 60 캐싱 적용

## Airtable 필드
- WEBTOON: title, author, platform(multiple select), genre(text, 쉼표구분 공백없음), status, thumbnail_url, avg_rating, review_count
- REVIEW: nickname, user_id, webtoon_id, rating(0.5단위), content, tags(text, 쉼표구분), is_public(checkbox), created_at
- USER: nickname, password_hash, created_at, profile_image(URL)
- READING_STATUS: user_id, nickname, webtoon_id, status, updated_at
- COLLECTION: name, description, is_public, user_id, created_at
- COLLECTION_ITEM: collection_id, webtoon_id, order
- FOLLOW: follower_id, following_id, followed_at

## 완성된 기능
- 닉네임+비밀번호 로그인/회원가입/탈퇴
- 헤더: 파란 네모 로고(홈, 클릭 시 active 피드백), 검색(돋보기), 프로필사진(마이페이지), 로그아웃(PC)
- 웹툰 목록: 장르/플랫폼 필터, 검색, 이번주 인기작
- 작품 상세:
  - 썸네일 + 제목/작가/별점/플랫폼/장르/연재상태 뱃지
  - 플랫폼 뱃지: 클릭 비활성(span, 홈에서 필터 가능)
  - 장르 뱃지: 클릭 → /genre/
  - +컬렉션 버튼 (모바일: 제목 우측)
  - 유저태그 집계 (top5 + 더보기), 클릭 → /tag/
  - 읽기상태 4개 버튼 (grid 4열)
  - 리뷰 작성: 반별(0.5단위) StarPicker, 태그입력, 공개/비공개 토글
  - 리뷰 목록 헤더: 프사+닉네임+별점 인라인, 내 리뷰만 토글(왼쪽)+텍스트(오른쪽) 표시, 수정/삭제
  - 이 작품이 담긴 컬렉션: 썸네일 카드 슬라이드
- 별점/리뷰: 0.5단위, 태그, 공개/비공개
- 읽기상태: 저장/토글/삭제/변경
- 웹툰 등록: 유사도 기반 중복 확인
- 마이페이지:
  - 프로필사진(연필버튼) + 이미지 URL 입력 (모바일 줄바꿈 수정)
  - 닉네임 수정
  - 컬렉션 2x2 썸네일 카드
  - 내 리뷰: 썸네일+제목+반별+태그+공개/비공개토글+수정/삭제
  - 읽기상태: 썸네일+상태변경버튼+필터
  - 하단 고정: 회원탈퇴 버튼
- 팔로우/언팔로우
- 컬렉션: 생성/수정/삭제, 웹툰 추가/제거, 썸네일 2x2 미리보기
- 유저 프로필: 프사+팔로워/팔로잉+리뷰/읽기상태
- 장르 페이지: /genre/[name]
- 태그 페이지: /tag/[name]
- 메인 배너 슬라이더 (2초, 모바일 스와이프)
- 홈 60초 캐싱

## 인증
- JWT (app/lib/auth.js)
- localStorage: token, nickname, userId
- API: Authorization: Bearer {token} 헤더

## UI 색상 기준
- 주요 파랑: #3B82F6
- 플랫폼 뱃지: bg #EBF5FF, text #185FA5
- 장르 뱃지: bg #F1EFE8, text #5F5E5A
- 연재상태 뱃지: bg #EAF3DE, text #3B6D11
- 유저태그: bg #EEEDFE, text #534AB7
- 별점: #E9A800
- 비활성 별: #D3D1C7

## 개발 컨벤션
- 파일 수정 요청 시 전체 파일 또는 찾기/교체 형태로 제공
- 코드 붙여넣기 후 git add . && git commit -m "..." && git push
- API 키는 .env.local에만 저장, 절대 커밋 금지

## 미완료 태스크
- 없음