# 웹툰로그 프로젝트

## 서비스 개요
웹툰 감상 기록 서비스 (향후 책 리뷰로 확장 예정)
- URL: webtoonlog.vercel.app
- GitHub: github.com/toonlog/webtoonlog
- 로컬: C:\Users\User\webtoonlog

## 기술 스택
- Next.js 16 (App Router, TypeScript)
- Airtable (DB)
- Cloudinary (이미지 업로드)
- Vercel (호스팅)

## Airtable
- BASE ID: appaauqeF3Nr9QMn3
- 테이블: WEBTOON, USER, REVIEW, READING_STATUS, COLLECTION, COLLECTION_ITEM, FOLLOW, REVIEW_LIKE, REVIEW_COMMENT, COLLECTION_LIKE, NOTIFICATION

## Airtable 필드
- WEBTOON: title, author, platform(multiple select), genre(text, 쉼표구분 공백없음), status, thumbnail_url, avg_rating, review_count
- REVIEW: nickname, user_id, webtoon_id, rating(0.5단위), content, tags(text, 쉼표구분), is_public(checkbox), created_at
- USER: nickname, password_hash, created_at, profile_image(URL)
- READING_STATUS: user_id, nickname, webtoon_id, status, updated_at
- COLLECTION: name, description, is_public, user_id, created_at
- COLLECTION_ITEM: collection_id, webtoon_id, order
- FOLLOW: follower_id, following_id, followed_at
- REVIEW_LIKE: review_id, user_id, created_at
- REVIEW_COMMENT: review_id, user_id, nickname, content, created_at
- COLLECTION_LIKE: collection_id, user_id, created_at
- NOTIFICATION: user_id, type, actor_id, actor_nickname, target_id, target_type, webtoon_id, is_read(checkbox), created_at

## 폴더 구조
app/
├── api/
│   ├── auth/
│   │   ├── login/route.js
│   │   ├── register/route.js
│   │   ├── update/route.js
│   │   └── delete/route.js
│   ├── collections/
│   │   ├── route.js
│   │   ├── items/route.js
│   │   └── like/route.js        ← 컬렉션 좋아요 토글, userId로 좋아요한 컬렉션 목록
│   ├── follow/route.js
│   ├── genre/route.js
│   ├── mypage/route.js          ← tags 필드 포함
│   ├── notifications/route.js   ← 알람 GET/PATCH(읽음처리)
│   ├── reading-status/route.js
│   ├── reviews/
│   │   ├── route.js             ← avg_rating 자동 업데이트, 읽기상태 포함
│   │   ├── like/route.js        ← 리뷰 좋아요 토글 + 알람
│   │   └── comments/route.js    ← 댓글 CRUD+PATCH + 알람
│   ├── tag/route.js
│   ├── upload/route.js          ← Cloudinary 이미지 업로드
│   ├── users/[id]/route.js
│   └── webtoons/
│       ├── route.js
│       ├── add/route.js
│       └── [id]/route.js
├── components/
│   ├── Carousel.tsx             ← 슬라이드 5개, 모바일 줄바꿈 적용
│   ├── CropModal.tsx            ← 이미지 크롭 모달 (aspect ratio 고정, 원형 옵션)
│   ├── FeedbackButton.tsx
│   ├── FilterBar.tsx            ← 장르/플랫폼 필터, 모바일 가로슬라이더
│   ├── Header.tsx               ← 검색, 프로필, 알람벨(뱃지), 모바일 로그아웃 아이콘
│   ├── ImageUpload.tsx          ← Cloudinary 파일 업로드, aspect/circular props 지원
│   ├── ScrollToTop.tsx          ← 300px 스크롤시 우측하단 버튼
│   ├── TagInput.tsx             ← 스페이스/엔터 뱃지생성, 백스페이스 삭제
│   └── WebtoonList.tsx          ← 무한스크롤 (초기 20개, 10개씩 추가)
├── lib/
│   ├── airtable.js
│   ├── auth.js
│   └── notification.js          ← createNotification 헬퍼
├── genre/[name]/page.tsx
├── tag/[name]/page.tsx
├── collections/
│   ├── page.tsx
│   └── [id]/page.tsx            ← 컬렉션 좋아요 버튼 (비소유자만), 핑크 하트
├── login/page.tsx
├── mypage/page.tsx              ← 좋아요한 컬렉션 섹션 추가
├── notifications/page.tsx       ← 알람 목록, 읽음 처리
├── users/[id]/page.tsx          ← 팔로우/언팔로우 토글, 모바일 레이아웃
├── webtoon/[id]/page.tsx        ← 리뷰 좋아요/댓글/수정, 읽기상태 뱃지, 좋아요 상태 유지
├── add/page.tsx                 ← 썸네일 Cloudinary 업로드, 등록 후 상세페이지 이동
└── page.tsx                     ← 60초 캐싱, ScrollToTop, WebtoonList 무한스크롤

## 완성된 기능
- 닉네임+비밀번호 로그인/회원가입/탈퇴
- 헤더: 로고(홈), 검색, 알람벨(읽지않은 뱃지), 프로필사진, 모바일 로그아웃 아이콘, PC 로그아웃
- 웹툰 목록: 장르/플랫폼 필터(모바일 가로슬라이더), 검색, 이번주 인기작, 무한스크롤
- 작품 상세:
  - 썸네일/제목/작가/별점/플랫폼/장르/연재상태 뱃지
  - +컬렉션 버튼
  - 유저태그 집계 top5+더보기
  - 읽기상태 4개 버튼
  - 리뷰 작성: 반별 StarPicker, TagInput, 공개/비공개 토글
  - 리뷰 목록: 프사+닉네임+별점+읽기상태뱃지+공개뱃지(본인만)
  - 리뷰 좋아요(핑크하트, 토글, 연속클릭방지, 상태유지), 댓글(CRUD), 댓글 프로필사진
  - 이 작품이 담긴 컬렉션 슬라이드
- avg_rating/review_count 자동 업데이트
- 읽기상태: 저장/토글/삭제/변경
- 웹툰 등록: 유사도 기반 중복 확인, 썸네일 Cloudinary 업로드, 등록 후 상세페이지 이동
- 마이페이지:
  - 프로필사진 Cloudinary 업로드 + 1:1 원형 크롭
  - 닉네임 수정
  - 내 컬렉션 2x2 썸네일
  - 좋아요한 컬렉션 섹션
  - 내 리뷰: TagInput, 별점/공개토글, 태그표시
  - 읽기상태: 상태변경+필터
  - 회원탈퇴
- 팔로우/언팔로우 토글
- 컬렉션: CRUD, 웹툰 추가/제거, 좋아요(비소유자, 토글, 핑크하트)
- 유저 프로필
- 장르/태그 페이지
- 메인 배너 슬라이더 (모바일 줄바꿈 적용)
- 홈 60초 캐싱
- 스크롤 탑 버튼
- OG 이미지
- 알람 시스템:
  - 트리거: 리뷰 좋아요, 리뷰 댓글, 컬렉션 좋아요, 팔로우, 팔로잉 유저 리뷰/컬렉션 작성
  - 헤더 벨 아이콘 + 읽지않은 수 뱃지
  - 알람 페이지 (읽음 처리)
- 이미지 크롭: 썸네일 3:4 고정, 프로필 1:1 원형 (react-image-crop)

## 인증
- JWT (app/lib/auth.js)
- localStorage: token, nickname, userId
- API: Authorization: Bearer {token} 헤더

## Cloudinary
- Cloud name: drjsztxws
- Upload preset: webtoonlog (unsigned)
- 환경변수: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

## UI 색상 기준
- 주요 파랑: #3B82F6
- 플랫폼 뱃지: bg #EBF5FF, text #185FA5
- 장르 뱃지: bg #F1EFE8, text #5F5E5A
- 연재상태 뱃지: bg #EAF3DE, text #3B6D11
- 유저태그: bg #EEEDFE, text #534AB7
- 별점: #F59E0B
- 비활성 별: #D3D1C7
- 공개뱃지: bg #D1FAE5, text #059669
- 읽기상태뱃지: bg #EBF5FF, text #185FA5
- 좋아요 하트: #ec4899

## 개발 컨벤션
- 파일 경로 표기: app/components/CropModal.tsx 형식으로 풀 경로 표기
- 코드 수정: 찾기/교체 형태로 제공
- 파일 생성: 터미널 명령어 먼저 제공 후 내용 제공
- 같은 파일 수정은 묶어서 한번에 제공
- 배포: git add .; git commit -m "메시지"; git push (Vercel 자동 배포)
- API 키는 .env.local에만 저장, Vercel 환경변수에도 추가 필요
- 기존 기능 절대 삭제하지 말 것 (추가만 할 것)
- 커밋 메시지 한국어로

## 향후 확장 계획
- 책 리뷰/기록 기능 추가 예정 (BOOK, BOOK_REVIEW 테이블)
- DB 설계 시 웹툰/책 공통 구조 고려 (유저/팔로우/컬렉션/알람 공유)
- 서비스명 변경 검토 중 (로그온/페이지로그 후보)
- 작품 상세 관련 작품 추천 (같은 장르/태그)
- 유저 기반 추천 알고리즘 (태그/별점/팔로잉 기반)
- 도메인 연결

## 미완료/확인 필요
- 알람 실제 작동 확인 중 (notification.js 재배포)
- 한국어 교정은 국립국어원 기준 엄격히 적용, 불확실한 경우 "확인 필요" 표기