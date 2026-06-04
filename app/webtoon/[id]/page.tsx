'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function WebtoonPage() {
  const params = useParams();
  const id = params.id as string;
  const [webtoon, setWebtoon] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [nickname, setNickname] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`/api/webtoons/${id}`).then(r => r.json()).then(setWebtoon);
    fetch(`/api/reviews?webtoonId=${id}`).then(r => r.json()).then(setReviews);
  }, [id]);

  async function submitReview() {
    if (!nickname || !content) return alert('닉네임과 리뷰를 입력해주세요!');
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webtoonId: id, nickname, rating, content }),
    });
    setContent('');
    setNickname('');
    fetch(`/api/reviews?webtoonId=${id}`).then(r => r.json()).then(setReviews);
    alert('리뷰가 등록되었습니다! 🎉');
  }

  if (!webtoon) return <div className="p-8 text-center">로딩중...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="bg-gray-200 rounded-lg h-60 mb-6" />
        <h1 className="text-2xl font-bold mb-1">{webtoon.title}</h1>
        <p className="text-gray-500 mb-1">{webtoon.author}</p>
        <p className="text-blue-500 text-sm mb-4">{webtoon.platform}</p>
        <p className="text-gray-700">{webtoon.description}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">리뷰 작성</h2>
        <input className="w-full border rounded p-2 mb-2" placeholder="닉네임" value={nickname} onChange={e => setNickname(e.target.value)} />
        <div className="flex gap-2 mb-2">
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
          ))}
        </div>
        <textarea className="w-full border rounded p-2 mb-2" rows={3} placeholder="리뷰를 작성해주세요" value={content} onChange={e => setContent(e.target.value)} />
        <button onClick={submitReview} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">등록</button>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4">리뷰 {reviews.length}개</h2>
        {reviews.length === 0 && <p className="text-gray-400">아직 리뷰가 없어요!</p>}
        {reviews.map(review => (
          <div key={review.id} className="border-b py-3 last:border-0">
            <div className="flex justify-between mb-1">
              <span className="font-bold text-sm">{review.rating}점</span>
            </div>
            <p className="text-gray-700 text-sm">{review.content}</p>
          </div>
        ))}
      </div>
    </main>
  );
}