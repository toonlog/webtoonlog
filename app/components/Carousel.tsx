'use client';
import { useEffect, useState } from 'react';

const slides = [
  {
    bg: 'bg-blue-500',
    textColor: 'text-white',
    descColor: 'text-blue-100',
    title: '감상을 나누고 싶은 작품을 직접 추가할 수 있어요',
    desc: '상단 + 웹툰 등록 버튼을 눌러 제목, 작가, 장르 등을 설정해 등록해보세요',
    visual: (
      <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="10" y="10" width="140" height="100" rx="10" fill="rgba(255,255,255,0.15)"/>
        <rect x="22" y="20" width="116" height="26" rx="6" fill="rgba(255,255,255,0.9)"/>
        <text x="80" y="37" textAnchor="middle" fontSize="12" fill="#1D4ED8" fontWeight="500">+ 웹툰 등록</text>
        <rect x="22" y="52" width="116" height="14" rx="4" fill="rgba(255,255,255,0.6)"/>
        <text x="80" y="63" textAnchor="middle" fontSize="9" fill="#1e3a8a">제목 *</text>
        <rect x="22" y="72" width="116" height="14" rx="4" fill="rgba(255,255,255,0.6)"/>
        <text x="80" y="83" textAnchor="middle" fontSize="9" fill="#1e3a8a">작가</text>
        <rect x="22" y="90" width="48" height="13" rx="6" fill="rgba(255,255,255,0.4)"/>
        <text x="46" y="100" textAnchor="middle" fontSize="8" fill="white">BL</text>
        <rect x="74" y="90" width="48" height="13" rx="6" fill="rgba(255,255,255,0.4)"/>
        <text x="98" y="100" textAnchor="middle" fontSize="8" fill="white">로맨스</text>
      </svg>
    ),
  },
  {
    bg: 'bg-white border border-gray-100',
    textColor: 'text-blue-800',
    descColor: 'text-gray-500',
    title: '원하는 작품을 검색하고 다른 독자들의 리뷰를 참고해보세요',
    desc: '검색창에 제목이나 작가명을 입력해 등록된 작품을 찾아보세요',
    visual: (
      <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="10" y="10" width="140" height="24" rx="12" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1"/>
        <text x="26" y="26" fontSize="10" fill="#93C5FD">검색...</text>
        <circle cx="143" cy="22" r="6" fill="none" stroke="#3B82F6" strokeWidth="1.5"/>
        <line x1="147" y1="26" x2="150" y2="29" stroke="#3B82F6" strokeWidth="1.5"/>
        <rect x="10" y="42" width="140" height="32" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5"/>
        <text x="20" y="56" fontSize="10" fill="#1e40af" fontWeight="500">복숭아소년</text>
        <text x="20" y="68" fontSize="8" fill="#94a3b8">★★★★★  5.0 (2개)</text>
        <rect x="10" y="80" width="140" height="32" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5"/>
        <text x="20" y="94" fontSize="10" fill="#1e40af" fontWeight="500">무저갱</text>
        <text x="20" y="106" fontSize="8" fill="#94a3b8">★★★★★  5.0 (2개)</text>
      </svg>
    ),
  },
  {
    bg: 'bg-sky-400',
    textColor: 'text-white',
    descColor: 'text-sky-100',
    title: '취향이 비슷한 유저를 팔로우해보세요',
    desc: '리뷰어 닉네임을 클릭하면 그 유저의 프로필과 리뷰 목록을 볼 수 있어요',
    visual: (
      <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="10" y="10" width="140" height="100" rx="10" fill="rgba(255,255,255,0.2)"/>
        <circle cx="55" cy="45" r="20" fill="rgba(255,255,255,0.9)"/>
        <text x="55" y="52" textAnchor="middle" fontSize="18">🦊</text>
        <text x="55" y="76" textAnchor="middle" fontSize="11" fill="white" fontWeight="500">웹툰러1</text>
        <text x="55" y="88" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.8)">팔로워 12  팔로잉 8</text>
        <rect x="96" y="32" width="48" height="20" rx="10" fill="white"/>
        <text x="120" y="46" textAnchor="middle" fontSize="10" fill="#2563EB" fontWeight="500">팔로우</text>
      </svg>
    ),
  },
  {
    bg: 'bg-white border border-gray-100',
    textColor: 'text-blue-800',
    descColor: 'text-gray-500',
    title: '마음에 드는 작품들을 컬렉션으로 모아보세요',
    desc: '컬렉션 메뉴에서 나만의 리스트를 만들고 다른 유저와 공유해보세요',
    visual: (
      <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="8" y="8" width="68" height="48" rx="8" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1"/>
        <text x="42" y="30" textAnchor="middle" fontSize="9" fill="#1e40af" fontWeight="500">무협 판타지</text>
        <text x="42" y="42" textAnchor="middle" fontSize="9" fill="#1e40af" fontWeight="500">모음</text>
        <text x="42" y="52" textAnchor="middle" fontSize="7" fill="#93c5fd">웹툰 8개</text>
        <rect x="84" y="8" width="68" height="48" rx="8" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1"/>
        <text x="118" y="30" textAnchor="middle" fontSize="9" fill="#166534" fontWeight="500">순애 모음</text>
        <text x="118" y="44" textAnchor="middle" fontSize="7" fill="#86efac">웹툰 5개</text>
        <rect x="8" y="64" width="144" height="48" rx="8" fill="#FFF7ED" stroke="#FED7AA" strokeWidth="1"/>
        <text x="80" y="85" textAnchor="middle" fontSize="9" fill="#9a3412" fontWeight="500">레진 BL 완결 모음</text>
        <text x="80" y="100" textAnchor="middle" fontSize="7" fill="#fb923c">웹툰 14개  공개</text>
      </svg>
    ),
  },
  {
    bg: 'bg-blue-700',
    textColor: 'text-white',
    descColor: 'text-blue-200',
    title: '읽기 상태로 작품을 체계적으로 관리해보세요',
    desc: '마이페이지에서 읽기 상태별로 작품을 한눈에 모아볼 수 있어요',
    visual: (
      <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="8" y="16" width="68" height="34" rx="17" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1"/>
        <text x="42" y="37" textAnchor="middle" fontSize="11" fill="#1e40af" fontWeight="500">읽는중</text>
        <rect x="84" y="16" width="68" height="34" rx="17" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1"/>
        <text x="118" y="37" textAnchor="middle" fontSize="11" fill="#166534" fontWeight="500">완독</text>
        <rect x="8" y="58" width="68" height="34" rx="17" fill="#F3E8FF" stroke="#D8B4FE" strokeWidth="1"/>
        <text x="42" y="79" textAnchor="middle" fontSize="10" fill="#6b21a8" fontWeight="500">읽고싶다</text>
        <rect x="84" y="58" width="68" height="34" rx="17" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
        <text x="118" y="79" textAnchor="middle" fontSize="11" fill="white" fontWeight="500">보류</text>
      </svg>
    ),
  },
];

export default function Carousel() {
  const [cur, setCur] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCur(prev => (prev + 1) % slides.length);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[cur];

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm">
      <div className={`${slide.bg} transition-all duration-500 flex items-center gap-4 p-5 md:p-7 min-h-[140px] md:min-h-[160px]`}>
        {/* 텍스트 */}
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-base md:text-lg leading-snug mb-1.5 ${slide.textColor}`}>
            {slide.title}
          </p>
          <p className={`text-xs md:text-sm leading-relaxed ${slide.descColor}`}>
            {slide.desc}
          </p>
        </div>
        {/* SVG 일러스트 */}
        <div className="w-28 h-24 md:w-40 md:h-32 flex-shrink-0">
          {slide.visual}
        </div>
      </div>

      {/* 도트 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCur(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === cur ? 'bg-white w-3' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
}