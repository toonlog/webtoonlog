markdown# 웹툰로그 프로젝트

## 서비스 개요
웹툰 감상 기록 서비스
- URL: webtoonlog.vercel.app
- GitHub: github.com/toonlog/webtoonlog

## 기술 스택
- Next.js 16 (App Router, TypeScript)
- Airtable (DB)
- Vercel (호스팅)

## Airtable
- BASE ID: appaauqeF3Nr9QMn3
- 테이블: WEBTOON, USER, REVIEW, READING_STATUS, COLLECTION, COLLECTION_ITEM, FOLLOW

## 폴더 구조
app/
api/
auth/
login/route.js        ← 로그인
register/route.js     ← 회원가입
update/route.js       ← 닉네임/프로필사진 변경
delete/route.js       ← 회원탈퇴
collections/
route.js              ← 컬렉션 CRUD (GET/POST/PATCH/DELETE)
items/route.js        ← 컬렉션 아이템 CRUD + preview=true 파라미터
follow/route.js         ← 팔로우/언팔로우
mypage/route.js         ← 내 리뷰/읽기상태 조회 (썸네일 포함)
reading-status/route.js ← 읽기상태 저장/수정/삭제
reviews/route.js        ← 리뷰 CRUD (tags 필드 포함)
users/[id]/route.js     ← 유저 프로필 (profile_image 포함)
webtoons/
route.js              ← 전체 웹툰 목록
add/route.js          ← 웹툰 등록
[id]/route.js         ← 웹툰 상세
components/
Carousel.tsx            ← 메인 배너 슬라이더 (2초 자동, 모바일 스와이프)
FeedbackButton.tsx      ← 피드백 버튼
Header.tsx              ← 헤더 (로그인 상태, 마이페이지, 컬렉션 링크)
lib/
airtable.js             ← Airtable 클라이언트
auth.js                 ← JWT + 비밀번호 해싱
genre/[name]/page.tsx     ← 장르별 작품 목록
tag/[name]/page.tsx       ← 유저태그별 작품 목록
collections/
page.tsx                ← 내 컬렉션 목록 (썸네일 2x2 그리드, PC 4열)
[id]/page.tsx           ← 컬렉션 상세
login/page.tsx            ← 로그인/회원가입
mypage/page.tsx           ← 마이페이지
users/[id]/page.tsx       ← 유저 프로필
webtoon/[id]/page.tsx     ← 작품 상세
add/page.tsx              ← 웹툰 등록
page.tsx                  ← 홈

## Airtable 필드 주요 사항
- WEBTOON: title, author, platform(multiple select), genre(text, 쉼표구분), status, thumbnail_url, avg_rating, review_count
- REVIEW: nickname, user_id, webtoon_id, rating, content, tags(text, 쉼표구분), is_public, created_at
- USER: nickname, password_hash, created_at, profile_image(URL)
- READING_STATUS: user_id, nickname, webtoon_id, status, updated_at
- COLLECTION: name, description, is_public, user_id, created_at
- COLLECTION_ITEM: collection_id, webtoon_id, order
- FOLLOW: follower_id, following_id, followed_at

## 완성된 기능
- 닉네임+비밀번호 로그인/회원가입/탈퇴
- 웹툰 목록 (장르/플랫폼 필터, 검색, 이번주 인기작)
- 작품 상세 (장르/플랫폼 뱃지 클릭→필터, 유저태그 집계, 리뷰 페이지네이션)
- 별점/리뷰 (작성/수정/삭제/공개비공개/태그)
- 읽기 상태 (읽는중/완독/읽고싶다/보류)
- 웹툰 등록 (유사도 기반 중복 확인)
- 마이페이지 (리뷰/읽기상태/컬렉션 모아보기, 닉네임/프로필사진 변경)
- 팔로우/언팔로우
- 컬렉션 (생성/수정/삭제, 웹툰 추가/제거, 썸네일 2x2 미리보기)
- 유저 프로필 페이지
- 메인 배너 슬라이더
- 장르/태그별 작품 목록 페이지

## 인증
- JWT (app/lib/auth.js)
- localStorage: token, nickname, userId
- API: Authorization: Bearer {token} 헤더

## 미완료 태스크
- 헤더 로그아웃 버튼 제거 (마이페이지 하단에만 있으면 됨)
- 마이페이지 이미지 저장/취소 버튼 모바일 줄바꿈 수정