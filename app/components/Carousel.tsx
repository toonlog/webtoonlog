'use client';
import { useEffect, useState, useRef } from 'react';

const slides = [
  {
    bg: '#3B82F6',
    textColor: '#ffffff',
    descColor: 'rgba(255,255,255,0.85)',
    title: '감상을 나누는 작품을 직접 추가할 수 있어요',
    titleBreak: true,
    desc: '+ 웹툰 등록 버튼을 눌러 제목, 작가, 장르 등을 설정해 등록해보세요',
    visual: (
      <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <rect x="10" y="10" width="140" height="100" rx="10" fill="rgba(255,255,255,0.15)"/>
        <rect x="22" y="20" width="116" height="26" rx="6" fill="rgba(255,255,255,0.9)"/>
        <text x="80" y="37" textAnchor="middle" fontSize="12" fill="#1D4ED8" fontWeight="500">+ 웹툰 등록</text>
        <rect x="22" y="52" width="116" height="14" rx="4" fill="rgba(255,255,255,0.6)"/>
        <text x="80" y="63" textAnchor="middle" fontSize="9" fill="#1e3a8a">제목 *</text>
        <rect x="22" y="72" width="116" height="14" rx="4" fill="rgba(255,255,255,0.6)"/>
        <text x="80" y="83" textAnchor="middle" fontSize="9" fill="#1e3a8a">작가</text>
       <rect x="22" y="90" width="34" height="13" rx="6" fill="rgba(255,255,255,0.4)"/>
        <text x="39" y="100" textAnchor="middle" fontSize="8" fill="white">BL</text>
        <rect x="60" y="90" width="34" height="13" rx="6" fill="rgba(255,255,255,0.4)"/>
        <text x="77" y="100" textAnchor="middle" fontSize="8" fill="white">로맨스</text>
        <rect x="98" y="90" width="34" height="13" rx="6" fill="rgba(255,255,255,0.4)"/>
        <text x="115" y="100" textAnchor="middle" fontSize="8" fill="white">무협</text>
    ),
  },
 {
    bg: '#1E40AF',
    textColor: '#ffffff',
    descColor: 'rgba(255,255,255,0.85)',
    title: '원하는 작품을 검색하고 리뷰를 참고해보세요',
    titleBreak: false,
    desc: '검색창에 제목이나 작가명을 입력해 등록된 작품을 찾아보세요',
    visual: (
      <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <rect x="10" y="10" width="140" height="24" rx="12" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
        <text x="26" y="26" fontSize="10" fill="rgba(255,255,255,0.7)">검색...</text>
        <circle cx="138" cy="22" r="5" fill="none" stroke="white" strokeWidth="1.5"/>
        <line x1="142" y1="26" x2="145" y2="29" stroke="white" strokeWidth="1.5"/>
        <rect x="10" y="42" width="140" height="32" rx="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
        <text x="20" y="56" fontSize="10" fill="white" fontWeight="500">복숭아소년</text>
        <text x="20" y="68" fontSize="8" fill="rgba(255,255,255,0.7)">★★★★★  5.0 (2개)</text>
        <rect x="10" y="80" width="140" height="32" rx="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
        <text x="20" y="94" fontSize="10" fill="white" fontWeight="500">무저갱</text>
        <text x="20" y="106" fontSize="8" fill="rgba(255,255,255,0.7)">★★★★★  5.0 (2개)</text>
      </svg>
    ),
  },
  {
    bg: '#1D4ED8',
    textColor: '#ffffff',
    descColor: 'rgba(255,255,255,0.85)',
    title: '취향이 비슷한 유저를 팔로우해보세요',
    titleBreak: false,
    desc: '리뷰어 닉네임을 클릭하면 그 유저의 프로필과 리뷰 목록을 볼 수 있어요',
  visual: (
      <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">

        <rect x="60" y="10" width="90" height="100" rx="10" fill="#FFF7ED" stroke="#FED7AA" strokeWidth="1"/>
        <rect x="64" y="14" width="42" height="42" rx="4" fill="#e5e7eb"/>
        <rect x="64" y="14" width="21" height="21" rx="2" fill="#d97706" opacity="0.6"/>
        <rect x="85" y="14" width="21" height="21" rx="2" fill="#f59e0b" opacity="0.5"/>
        <rect x="64" y="35" width="21" height="21" rx="2" fill="#fbbf24" opacity="0.4"/>
        <rect x="85" y="35" width="21" height="21" rx="2" fill="#d97706" opacity="0.3"/>
        <text x="109" y="40" textAnchor="middle" fontSize="7" fill="#9a3412" fontWeight="500">레진 BL</text>
        <text x="109" y="50" textAnchor="middle" fontSize="7" fill="#9a3412">완결 모음</text>
        <text x="109" y="102" textAnchor="middle" fontSize="6" fill="#f97316">웹툰 14개</text>

        <rect x="35" y="10" width="90" height="100" rx="10" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1"/>
        <rect x="39" y="14" width="42" height="42" rx="4" fill="#e5e7eb"/>
        <rect x="39" y="14" width="21" height="21" rx="2" fill="#16a34a" opacity="0.6"/>
        <rect x="60" y="14" width="21" height="21" rx="2" fill="#22c55e" opacity="0.5"/>
        <rect x="39" y="35" width="21" height="21" rx="2" fill="#4ade80" opacity="0.4"/>
        <rect x="60" y="35" width="21" height="21" rx="2" fill="#16a34a" opacity="0.3"/>
        <text x="95" y="40" textAnchor="middle" fontSize="8" fill="#166534" fontWeight="500">순애</text>
        <text x="95" y="51" textAnchor="middle" fontSize="8" fill="#166534">모음</text>
        <text x="95" y="102" textAnchor="middle" fontSize="6" fill="#22c55e">웹툰 5개</text>

        <rect x="10" y="10" width="90" height="100" rx="10" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1"/>
        <rect x="14" y="14" width="42" height="42" rx="4" fill="#e5e7eb"/>
        <rect x="14" y="14" width="21" height="21" rx="2" fill="#1d4ed8" opacity="0.6"/>
        <rect x="35" y="14" width="21" height="21" rx="2" fill="#3b82f6" opacity="0.5"/>
        <rect x="14" y="35" width="21" height="21" rx="2" fill="#60a5fa" opacity="0.4"/>
        <rect x="35" y="35" width="21" height="21" rx="2" fill="#1d4ed8" opacity="0.3"/>
        <text x="70" y="40" textAnchor="middle" fontSize="8" fill="#1e40af" fontWeight="500">무협</text>
        <text x="70" y="51" textAnchor="middle" fontSize="8" fill="#1e40af">판타지</text>
        <text x="70" y="102" textAnchor="middle" fontSize="6" fill="#3b82f6">웹툰 8개</text>
      </svg>
    ),
  },
  {
    bg: '#F1F5F9',
    textColor: '#1e3a8a',
    descColor: '#475569',
    title: '마음에 드는 작품들을 컬렉션으로 모아보세요',
    titleBreak: false,
    desc: '컬렉션 메뉴에서 나만의 리스트를 만들고 다른 유저와 공유해보세요',
    visual: (
      <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <rect x="8" y="8" width="68" height="48" rx="8" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1"/>
        <text x="42" y="30" textAnchor="middle" fontSize="9" fill="#1e40af" fontWeight="500">무협 판타지</text>
        <text x="42" y="42" textAnchor="middle" fontSize="9" fill="#1e40af" fontWeight="500">모음</text>
        <text x="42" y="52" textAnchor="middle" fontSize="7" fill="#3b82f6">웹툰 8개</text>
        <rect x="84" y="8" width="68" height="48" rx="8" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1"/>
        <text x="118" y="30" textAnchor="middle" fontSize="9" fill="#166534" fontWeight="500">순애 모음</text>
        <text x="118" y="44" textAnchor="middle" fontSize="7" fill="#22c55e">웹툰 5개</text>
        <rect x="8" y="64" width="144" height="48" rx="8" fill="#FFF7ED" stroke="#FED7AA" strokeWidth="1"/>
        <text x="80" y="85" textAnchor="middle" fontSize="9" fill="#9a3412" fontWeight="500">레진 BL 완결 모음</text>
        <text x="80" y="100" textAnchor="middle" fontSize="7" fill="#f97316">웹툰 14개  공개</text>
      </svg>
    ),
  },
  {
    bg: '#1D4ED8',
    textColor: '#ffffff',
    descColor: 'rgba(255,255,255,0.85)',
    title: '읽기 상태로 작품을 체계적으로 관리해보세요',
    titleBreak: false,
    desc: '마이페이지에서 읽기 상태별로 작품을 한눈에 모아볼 수 있어요',
    visual: (
      <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <rect x="8" y="16" width="68" height="34" rx="17" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1"/>
        <text x="42" y="37" textAnchor="middle" fontSize="11" fill="#1e40af" fontWeight="500">읽는중</text>
        <rect x="84" y="16" width="68" height="34" rx="17" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1"/>
        <text x="118" y="37" textAnchor="middle" fontSize="11" fill="#166534" fontWeight="500">완독</text>
        <rect x="8" y="58" width="68" height="34" rx="17" fill="#F3E8FF" stroke="#D8B4FE" strokeWidth="1"/>
        <text x="42" y="79" textAnchor="middle" fontSize="10" fill="#6b21a8" fontWeight="500">읽고싶다</text>
        <rect x="84" y="58" width="68" height="34" rx="17" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
        <text x="118" y="79" textAnchor="middle" fontSize="11" fill="white" fontWeight="500">보류</text>
      </svg>
    ),
  },
];

export default function Carousel() {
  const [cur, setCur] = useState(0);
 const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCur(prev => (prev + 1) % slides.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    touchEndX.current = e.changedTouches[0].clientX;
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCur(prev => (prev + 1) % slides.length);
      } else {
        setCur(prev => (prev - 1 + slides.length) % slides.length);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }

  if (isMobile === null) return <div style={{ borderRadius: '16px', background: '#fff', minHeight: '160px' }} />;
  const slide = slides[cur];

  const renderTitle = (title: string, titleBreak: boolean) => {
    if (!titleBreak) return title;
    const parts = title.split(' ').slice(0, 4).join(' ');
    const rest = title.split(' ').slice(4).join(' ');
    return <>{parts}<br />{rest}</>;
  };

  return (
    <div
      style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div style={{
        backgroundColor: slide.bg,
        transition: 'background-color 0.5s ease',
        minHeight: isMobile ? '160px' : '260px',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '12px' : '32px',
        padding: isMobile ? '20px 16px 32px' : '40px 48px 52px',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            color: slide.textColor,
            fontWeight: 700,
            fontSize: isMobile ? '15px' : '28px',
            lineHeight: '1.4',
            marginBottom: isMobile ? '6px' : '14px',
            wordBreak: 'keep-all',
            overflowWrap: 'break-word',
          }}>
            {renderTitle(slide.title, slide.titleBreak)}
          </p>
          <p style={{
            color: slide.descColor,
            fontSize: isMobile ? '12px' : '16px',
            lineHeight: '1.6',
            wordBreak: 'keep-all',
            overflowWrap: 'break-word',
            margin: 0,
          }}>
            {slide.desc}
          </p>
        </div>
        <div style={{
          width: isMobile ? '110px' : '220px',
          height: isMobile ? '90px' : '180px',
          flexShrink: 0,
        }}>
          {slide.visual}
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '6px',
      }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCur(i)} style={{
            width: i === cur ? '12px' : '6px',
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255,255,255,0.8)',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            transition: 'width 0.3s',
          }} />
        ))}
      </div>
    </div>
  );
}