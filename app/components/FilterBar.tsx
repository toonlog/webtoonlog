'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ALL_GENRES = ['BL', 'GL', '로맨스', '판타지', '현대', '드라마', '액션', '무협', '스릴러', '공포', '개그', 'SF', '스포츠', '일상'];
const ALL_PLATFORMS = ['네이버웹툰', '카카오페이지', '레진코믹스', '봄툰', '리디', '피너툰', '탑툰', '코미코', '기타'];
const TOP_N = 5;

export default function FilterBar({ initialGenre, initialPlatform, search }: {
  initialGenre: string;
  initialPlatform: string;
  search: string;
}) {
  const router = useRouter();
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);

  function navigate(genre: string, platform: string) {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (genre) params.set('genre', genre);
    if (platform) params.set('platform', platform);
    router.push(`/?${params.toString()}`);
  }

  const btnStyle = (active: boolean, activeColor: string): React.CSSProperties => ({
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 14,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    border: active ? 'none' : '1px solid #D3D1C7',
    background: active ? activeColor : 'white',
    color: active ? 'white' : '#374151',
    cursor: 'pointer',
  });

  const moreBtnStyle: React.CSSProperties = {
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 14,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    border: '1px solid #D3D1C7',
    background: 'white',
    color: '#9ca3af',
    cursor: 'pointer',
  };

  // 모바일: 슬라이더(TOP_N + 더보기) / 더보기 누르면 wrap 2줄
  // PC: 기존 방식 유지
  return (
    <div>
      {/* 장르 */}
      <div className="max-w-4xl mx-auto mb-3">
        {/* 모바일 */}
        <div className="md:hidden">
          {!showAllGenres ? (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
              <button onClick={() => navigate('', initialPlatform)} style={btnStyle(!initialGenre, '#3B82F6')}>전체</button>
              {ALL_GENRES.slice(0, TOP_N).map(g => (
                <button key={g} onClick={() => navigate(g, initialPlatform)} style={btnStyle(initialGenre === g, '#3B82F6')}>{g}</button>
              ))}
              <button onClick={() => setShowAllGenres(true)} style={moreBtnStyle}>+ 더보기</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <button onClick={() => navigate('', initialPlatform)} style={btnStyle(!initialGenre, '#3B82F6')}>전체</button>
              {ALL_GENRES.map(g => (
                <button key={g} onClick={() => navigate(g, initialPlatform)} style={btnStyle(initialGenre === g, '#3B82F6')}>{g}</button>
              ))}
              <button onClick={() => setShowAllGenres(false)} style={moreBtnStyle}>접기</button>
            </div>
          )}
        </div>
        {/* PC */}
        <div className="hidden md:flex flex-wrap gap-2">
          <button onClick={() => navigate('', initialPlatform)} style={btnStyle(!initialGenre, '#3B82F6')}>전체</button>
          {(showAllGenres ? ALL_GENRES : ALL_GENRES.slice(0, 7)).map(g => (
            <button key={g} onClick={() => navigate(g, initialPlatform)} style={btnStyle(initialGenre === g, '#3B82F6')}>{g}</button>
          ))}
          <button onClick={() => setShowAllGenres(v => !v)} style={moreBtnStyle}>{showAllGenres ? '접기' : '+ 더보기'}</button>
        </div>
      </div>

      {/* 플랫폼 */}
      <div className="max-w-4xl mx-auto mb-6">
        {/* 모바일 */}
        <div className="md:hidden">
          {!showAllPlatforms ? (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
              <button onClick={() => navigate(initialGenre, '')} style={btnStyle(!initialPlatform, '#534AB7')}>전체</button>
              {ALL_PLATFORMS.slice(0, TOP_N).map(p => (
                <button key={p} onClick={() => navigate(initialGenre, p)} style={btnStyle(initialPlatform === p, '#534AB7')}>{p}</button>
              ))}
              <button onClick={() => setShowAllPlatforms(true)} style={moreBtnStyle}>+ 더보기</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <button onClick={() => navigate(initialGenre, '')} style={btnStyle(!initialPlatform, '#534AB7')}>전체</button>
              {ALL_PLATFORMS.map(p => (
                <button key={p} onClick={() => navigate(initialGenre, p)} style={btnStyle(initialPlatform === p, '#534AB7')}>{p}</button>
              ))}
              <button onClick={() => setShowAllPlatforms(false)} style={moreBtnStyle}>접기</button>
            </div>
          )}
        </div>
        {/* PC */}
        <div className="hidden md:flex flex-wrap gap-2">
          <button onClick={() => navigate(initialGenre, '')} style={btnStyle(!initialPlatform, '#534AB7')}>전체</button>
          {(showAllPlatforms ? ALL_PLATFORMS : ALL_PLATFORMS.slice(0, 7)).map(p => (
            <button key={p} onClick={() => navigate(initialGenre, p)} style={btnStyle(initialPlatform === p, '#534AB7')}>{p}</button>
          ))}
          <button onClick={() => setShowAllPlatforms(v => !v)} style={moreBtnStyle}>{showAllPlatforms ? '접기' : '+ 더보기'}</button>
        </div>
      </div>
    </div>
  );
}