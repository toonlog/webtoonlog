'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ALL_GENRES = ['BL', 'GL', '로맨스', '판타지', '현대', '드라마', '액션', '무협', '스릴러', '공포', '개그', 'SF', '스포츠', '일상'];
const ALL_PLATFORMS = ['네이버웹툰', '카카오페이지', '레진코믹스', '봄툰', '리디', '피너툰', '탑툰', '코미코', '기타'];
const TOP_GENRES = ALL_GENRES.slice(0, 7);
const TOP_PLATFORMS = ALL_PLATFORMS.slice(0, 7);

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

  const visibleGenres = showAllGenres ? ALL_GENRES : TOP_GENRES;
  const visiblePlatforms = showAllPlatforms ? ALL_PLATFORMS : TOP_PLATFORMS;

  const scrollStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: 8,
    overflowX: 'auto',
    paddingBottom: 4,
    scrollbarWidth: 'none',
  };

  const btnStyle = (active: boolean, activeColor: string): React.CSSProperties => ({
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 14,
    border: active ? 'none' : '1px solid #D3D1C7',
    background: active ? activeColor : 'white',
    color: active ? 'white' : '#374151',
    cursor: 'pointer',
    flexShrink: 0,
  });

  const moreBtnStyle: React.CSSProperties = {
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 14,
    border: '1px solid #D3D1C7',
    background: 'white',
    color: '#9ca3af',
    cursor: 'pointer',
    flexShrink: 0,
  };

  return (
    <div>
      {/* 장르 필터 */}
      <div className="max-w-4xl mx-auto mb-3">
        <div className="hide-scrollbar" style={scrollStyle}>
          <button onClick={() => navigate('', initialPlatform)} style={btnStyle(!initialGenre, '#3B82F6')}>전체</button>
          {visibleGenres.map(g => (
            <button key={g} onClick={() => navigate(g, initialPlatform)} style={btnStyle(initialGenre === g, '#3B82F6')}>{g}</button>
          ))}
          {!showAllGenres ? (
            <button onClick={() => setShowAllGenres(true)} style={moreBtnStyle}>+ 더보기</button>
          ) : (
            <button onClick={() => setShowAllGenres(false)} style={moreBtnStyle}>접기</button>
          )}
        </div>
      </div>

      {/* 플랫폼 필터 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="hide-scrollbar" style={scrollStyle}>
          <button onClick={() => navigate(initialGenre, '')} style={btnStyle(!initialPlatform, '#534AB7')}>전체</button>
          {visiblePlatforms.map(p => (
            <button key={p} onClick={() => navigate(initialGenre, p)} style={btnStyle(initialPlatform === p, '#534AB7')}>{p}</button>
          ))}
          {!showAllPlatforms ? (
            <button onClick={() => setShowAllPlatforms(true)} style={moreBtnStyle}>+ 더보기</button>
          ) : (
            <button onClick={() => setShowAllPlatforms(false)} style={moreBtnStyle}>접기</button>
          )}
        </div>
      </div>
    </div>
  );
}