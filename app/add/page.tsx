'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/app/components/ImageUpload';

const DEFAULT_GENRES = ['BL', 'GL', '로맨스', '판타지', '현대', '드라마', '액션', '무협', '스릴러', '공포', '개그', 'SF', '스포츠', '일상'];
const PLATFORMS = ['네이버웹툰', '카카오페이지', '레진코믹스', '봄툰', '리디', '피너툰', '탑툰', '코미코', '기타'];

export default function AddWebtoon() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [platform, setPlatform] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>(DEFAULT_GENRES);
  const [customGenre, setCustomGenre] = useState('');
  const [status, setStatus] = useState('연재중');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [similarWebtoons, setSimilarWebtoons] = useState<any[]>([]);
  const [showSimilar, setShowSimilar] = useState(false);

  function normalize(str: string) {
    return str.replace(/\s/g, '').toLowerCase();
  }

  async function checkSimilar() {
    if (!title.trim()) return;
    const res = await fetch('/api/webtoons?all=true');
    const data = await res.json();
    const normalizedInput = normalize(title);
    const similar = data.filter((w: any) => {
      const normalizedTitle = normalize(w.title || '');
      return (
        normalizedTitle.includes(normalizedInput) ||
        normalizedInput.includes(normalizedTitle) ||
        levenshtein(normalizedInput, normalizedTitle) <= 2
      );
    });
    if (similar.length > 0) {
      setSimilarWebtoons(similar);
      setShowSimilar(true);
    }
  }

  function levenshtein(a: string, b: string): number {
    const dp = Array.from({ length: a.length + 1 }, (_, i) =>
      Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = a[i-1] === b[j-1]
          ? dp[i-1][j-1]
          : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      }
    }
    return dp[a.length][b.length];
  }

  function toggleGenre(genre: string) {
    setGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
  }

  function addCustomGenre() {
    const trimmed = customGenre.trim();
    if (!trimmed) return;
    if (!allGenres.includes(trimmed)) setAllGenres(prev => [...prev, trimmed]);
    if (!genres.includes(trimmed)) setGenres(prev => [...prev, trimmed]);
    setCustomGenre('');
  }

  async function handleSubmit() {
    if (!title) return alert('제목을 입력해주세요!');
    setLoading(true);
const res = await fetch('/api/webtoons/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author, platform, genre: genres, status, thumbnailUrl }),
    });
  if (res.ok) {
      const data = await res.json();
      alert('등록 완료! 🎉\n리뷰를 통해 의견을 나눠보세요!');
      router.replace(`/webtoon/${data.id}`);
    } else {
      alert('오류가 발생했어요');
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">웹툰 등록</h1>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
        <div>
          <input className="border rounded p-2 w-full text-gray-900" placeholder="제목 *" value={title}
            onChange={e => { setTitle(e.target.value); setShowSimilar(false); }}
            onBlur={checkSimilar} />
          {showSimilar && similarWebtoons.length > 0 && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700 font-medium mb-2">⚠️ 비슷한 작품이 있어요! 확인해보세요:</p>
              {similarWebtoons.map(w => (
                <a key={w.id} href={`/webtoon/${w.id}`} target="_blank"
                  className="block text-sm text-blue-500 hover:underline py-0.5">
                  {w.title} ({w.author})
                </a>
              ))}
              <button onClick={() => setShowSimilar(false)}
                className="text-xs text-gray-400 mt-2 hover:text-gray-600">
                무시하고 계속 등록
              </button>
            </div>
          )}
        </div>
        <input className="border rounded p-2 text-gray-900" placeholder="작가" value={author} onChange={e => setAuthor(e.target.value)} />
        <select className="border rounded p-2 text-gray-900" value={platform} onChange={e => setPlatform(e.target.value)}>
          <option value="">플랫폼 선택</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <div>
          <p className="text-sm text-gray-600 mb-2">장르 (복수 선택 가능)</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {allGenres.map(g => (
              <button key={g} type="button" onClick={() => toggleGenre(g)}
                className={`px-3 py-1 rounded-full text-sm border transition ${genres.includes(g) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                {g}
              </button>
            ))}
          </div>
         <div className="flex gap-2 items-center">
            <input className="border rounded p-2 flex-1 text-sm text-gray-900" placeholder="직접 입력해서 장르 추가..." value={customGenre}
              onChange={e => setCustomGenre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomGenre()} />
            <button type="button" onClick={addCustomGenre} className="bg-gray-100 px-3 py-2 rounded text-sm hover:bg-gray-200 whitespace-nowrap flex-shrink-0">+ 추가</button>
          </div>
        </div>
     <select className="border rounded p-2 text-gray-900 pr-8" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="연재중">연재중</option>
          <option value="완결">완결</option>
          <option value="휴재">휴재</option>
        </select>
<div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400">카드에 노출되는 썸네일 이미지를 직접 업로드할 수 있어요!</p>
          <ImageUpload onUpload={(url) => setThumbnailUrl(url)} />
          {thumbnailUrl && <img src={thumbnailUrl} alt="썸네일 미리보기" className="w-full h-40 object-cover rounded-lg" />}
        </div>
        <button onClick={handleSubmit} disabled={loading} className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50">
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </main>
  );
}