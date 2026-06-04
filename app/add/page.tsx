'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddWebtoon() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [platform, setPlatform] = useState('');
  const [genre, setGenre] = useState('');
  const [status, setStatus] = useState('연재중');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title) return alert('제목을 입력해주세요!');
    setLoading(true);
    const res = await fetch('/api/webtoons/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author, platform, genre, status }),
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
          <option value="네이버웹툰">네이버웹툰</option>
          <option value="카카오페이지">카카오페이지</option>
          <option value="레진코믹스">레진코믹스</option>
          <option value="봄툰">봄툰</option>
          <option value="리디">리디</option>
          <option value="기타">기타</option>
        </select>
        <select className="border rounded p-2" value={genre} onChange={e => setGenre(e.target.value)}>
          <option value="">장르 선택</option>
          <option value="BL">BL</option>
          <option value="로맨스">로맨스</option>
          <option value="판타지">판타지</option>
          <option value="현대">현대</option>
          <option value="드라마">드라마</option>
          <option value="액션">액션</option>
        </select>
        <select className="border rounded p-2" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="연재중">연재중</option>
          <option value="완결">완결</option>
          <option value="휴재">휴재</option>
        </select>
        <button onClick={handleSubmit} disabled={loading} className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50">
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </main>
  );
}