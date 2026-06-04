'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      alert('등록 완료! 🎉');
      router.push('/');
    } else {
      alert('오류가 발생했어요');
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">웹툰 등록</h1>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
        <input className="border rounded p-2" placeholder="제목 *" value={title} onChange={e => setTitle(e.target.value)} />
        <input className="border rounded p-2" placeholder="작가" value={author} onChange={e => setAuthor(e.target.value)} />
        <select className="border rounded p-2" value={platform} onChange={e => setPlatform(e.target.value)}>
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
          <div className="flex gap-2">
            <input className="border rounded p-2 flex-1 text-sm" placeholder="직접 입력해서 장르 추가..." value={customGenre}
              onChange={e => setCustomGenre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomGenre()} />
            <button type="button" onClick={addCustomGenre} className="bg-gray-100 px-3 py-2 rounded text-sm hover:bg-gray-200">+ 추가</button>
          </div>
        </div>
        <select className="border rounded p-2" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="연재중">연재중</option>
          <option value="완결">완결</option>
          <option value="휴재">휴재</option>
        </select>
        <input className="border rounded p-2" placeholder="썸네일 URL (선택)" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} />
        {thumbnailUrl && <img src={thumbnailUrl} alt="썸네일 미리보기" className="w-full h-40 object-cover rounded-lg" />}
        <button onClick={handleSubmit} disabled={loading} className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50">
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </main>
  );
}