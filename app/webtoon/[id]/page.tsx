'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function getAuth() {
  return {
    token: localStorage.getItem('token'),
    nickname: localStorage.getItem('nickname'),
    userId: localStorage.getItem('userId'),
  };
}

export default function WebtoonPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [webtoon, setWebtoon] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [readStatus, setReadStatus] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState('');
  const [auth, setAuth] = useState<{ token: string | null; nickname: string | null; userId: string | null }>({ token: null, nickname: null, userId: null });
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);
  const [webtoonCollections, setWebtoonCollections] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'latest' | 'likes'>('latest');

  useEffect(() => {
    const a = getAuth();
    setAuth(a);
    fetch(`/api/webtoons/${id}`).then(r => r.json()).then(setWebtoon);
    fetchReviews();
    fetchWebtoonCollections();
    if (a.userId) {
      fetchStatus(a.userId);
      fetchCollections(a.userId);
    }
    const onAuth = () => {
      const newAuth = getAuth();
      setAuth(newAuth);
      if (newAuth.userId) {
        fetchStatus(newAuth.userId);
        fetchCollections(newAuth.userId);
      }
    };
    window.addEventListener('authChange', onAuth);
    return () => window.removeEventListener('authChange', onAuth);
  }, [id]);

  function fetchReviews() {
    fetch(`/api/reviews?webtoonId=${id}`).then(r => r.json()).then(setReviews);
  }

  function fetchStatus(userId: string) {
    fetch(`/api/reading-status?webtoonId=${id}&userId=${userId}`)
      .then(r => r.json()).then(data => setReadStatus(data.status));
  }

  function fetchCollections(userId: string) {
    fetch(`/api/collections?userId=${userId}`).then(r => r.json()).then(setCollections);
  }

  function fetchWebtoonCollections() {
    fetch(`/api/collections?webtoonId=${id}`).then(r => r.json()).then(setWebtoonCollections);
  }

  async function addToCollection(collectionId: string) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/collections/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ collectionId, webtoonId: id }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    alert('컬렉션에 추가됐어요! 🎉');
    setShowCollectionMenu(false);
    fetchWebtoonCollections();
  }

  async function submitReview() {
    if (!auth.token) return router.push('/login');
    if (!content.trim()) return alert('리뷰 내용을 입력해주세요!');
    setLoading(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ webtoonId: id, rating, content }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return alert(data.error);
    setContent('');
    setRating(5);
    fetchReviews();
  }

  async function submitStatus(status: string) {
    if (!auth.token) return router.push('/login');
    const res = await fetch('/api/reading-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ webtoonId: id, status }),
    });
    const data = await res.json();
    setReadStatus(data.status);
  }

  async function deleteReview(reviewId: string) {
    if (!confirm('리뷰를 삭제할까요?')) return;
    await fetch(`/api/reviews?reviewId=${reviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    fetchReviews();
  }

  async function saveEdit(reviewId: string) {
    const res = await fetch('/api/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ reviewId, rating: editRating, content: editContent }),
    });
    if (res.ok) { setEditingId(null); fetchReviews(); }
  }

  async function toggleLike(reviewId: string) {
    if (!auth.token) return router.push('/login');
    const res = await fetch('/api/reviews/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ reviewId }),
    });
    if (res.ok) fetchReviews();
  }

  const statusList = ['읽는중', '완독', '읽고싶다', '보류'];
  const statusColors: Record<string, string> = {
    '읽는중': 'bg-blue-100 text-blue-600',
    '완독': 'bg-green-100 text-green-600',
    '읽고싶다': 'bg-purple-100 text-purple-600',
    '보류': 'bg-gray-100 text-gray-500',
  };

  if (!webtoon) return <div className="p-8 text-center">로딩중...</div>;
  const myReview = reviews.find(r => r.userId === auth.userId);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'likes') return (b.like_count || 0) - (a.like_count || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8 max-w-2xl mx-auto">

      {/* 작품 정보 */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex gap-4">
          {webtoon.thumbnail_url ? (
            <img src={webtoon.thumbnail_url} alt={webtoon.title} className="w-24 h-32 object-cover rounded-lg flex-shrink-0" />
          ) : (
            <div className="w-24 h-32 bg-gray-200 rounded-lg flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">{webtoon.title}</h1>
                <p className="text-gray-500 mb-1">{webtoon.author}</p>
                <p className="text-blue-500 text-sm mb-2">{webtoon.platform}</p>
                {avgRating ? (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="font-bold">{avgRating}</span>
                    <span className="text-gray-400 text-sm">({reviews.length}개)</span>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">아직 리뷰가 없어요</p>
                )}
              </div>
              {auth.token && (
                <div className="relative">
                  <button onClick={() => setShowCollectionMenu(!showCollectionMenu)}
                    className="text-sm bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition">
                    + 컬렉션
                  </button>
                  {showCollectionMenu && (
                    <div className="absolute right-0 top-10 bg-white shadow-lg rounded-xl p-3 w-48 z-10">
                      {collections.length === 0 ? (
                        <div className="text-sm text-gray-400 p-2">
                          <Link href="/collections" className="text-blue-500 hover:underline">컬렉션 만들기</Link>
                        </div>
                      ) : (
                        collections.map(c => (
                          <button key={c.id} onClick={() => addToCollection(c.id)}
                            className="w-full text-left text-sm px-3 py-2 hover:bg-gray-50 rounded-lg">
                            {c.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 읽기 상태 */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-3">읽기 상태</h2>
        {!auth.token ? (
          <p className="text-gray-400 text-sm">
            <button onClick={() => router.push('/login')} className="text-blue-500 underline">로그인</button> 후 상태를 저장할 수 있어요
          </p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {statusList.map(s => (
              <button key={s} onClick={() => submitStatus(s)}
                className={`px-4 py-2 rounded-full text-sm border transition ${readStatus === s ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 이 웹툰을 담은 공개 컬렉션 */}
      {webtoonCollections.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-3">이 작품이 담긴 컬렉션</h2>
          <div className="flex flex-col gap-2">
            {webtoonCollections.map(c => (
              <Link key={c.id} href={`/collections/${c.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition border">
                <span className="font-medium text-sm">{c.name}</span>
                {c.description && <span className="text-gray-400 text-xs">{c.description}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 리뷰 작성 */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">리뷰 작성</h2>
        {!auth.token ? (
          <p className="text-gray-400 text-sm">
            <button onClick={() => router.push('/login')} className="text-blue-500 underline">로그인</button> 후 리뷰를 작성할 수 있어요
          </p>
        ) : myReview ? (
          <p className="text-gray-400 text-sm">이미 리뷰를 작성했어요. 아래에서 수정할 수 있어요!</p>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-2">{auth.nickname} 님으로 작성됩니다</p>
            <div className="flex gap-1 mb-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
              ))}
            </div>
            <textarea className="w-full border rounded p-2 mb-2 text-sm" rows={3}
              placeholder="리뷰를 작성해주세요" value={content} onChange={e => setContent(e.target.value)} />
            <button onClick={submitReview} disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 text-sm">
              {loading ? '등록 중...' : '등록'}
            </button>
          </>
        )}
      </div>

      {/* 리뷰 목록 */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">리뷰 {reviews.length}개{avgRating && ` · 평균 ★${avgRating}`}</h2>
          <div className="flex gap-1">
            <button onClick={() => setSortBy('latest')}
              className={`text-xs px-3 py-1 rounded-full border transition ${sortBy === 'latest' ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}>
              최신순
            </button>
            <button onClick={() => setSortBy('likes')}
              className={`text-xs px-3 py-1 rounded-full border transition ${sortBy === 'likes' ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}>
              좋아요순
            </button>
          </div>
        </div>
        {reviews.length === 0 && <p className="text-gray-400">아직 리뷰가 없어요!</p>}
        {sortedReviews.map(review => {
          const isLiked = auth.userId && review.liked_by?.split(',').includes(auth.userId);
          return (
            <div key={review.id} className="border-b py-4 last:border-0">
              {editingId === review.id ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setEditRating(n)} className={`text-xl ${n <= editRating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                    ))}
                  </div>
                  <textarea className="border rounded p-2 text-sm w-full" rows={3}
                    value={editContent} onChange={e => setEditContent(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(review.id)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">저장</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-100 px-3 py-1 rounded text-sm">취소</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {review.userId ? (
                        <Link href={`/users/${review.userId}`} className="font-bold text-sm hover:text-blue-500 transition">
                          {review.nickname}
                        </Link>
                      ) : (
                        <span className="font-bold text-sm">{review.nickname}</span>
                      )}
                      <span className="text-yellow-400 text-sm">{'★'.repeat(review.rating)}</span>
                      {review.readStatus && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[review.readStatus] || 'bg-gray-100 text-gray-500'}`}>
                          {review.readStatus}
                        </span>
                      )}
                    </div>
                    {review.userId === auth.userId && (
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingId(review.id); setEditRating(review.rating); setEditContent(review.content); }}
                          className="text-xs text-gray-400 hover:text-blue-500">수정</button>
                        <button onClick={() => deleteReview(review.id)}
                          className="text-xs text-gray-400 hover:text-red-500">삭제</button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm">{review.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-gray-400 text-xs">{review.created_at}</p>
                    <button onClick={() => toggleLike(review.id)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition ${isLiked ? 'bg-red-50 text-red-500 border-red-200' : 'text-gray-400 hover:bg-gray-50'}`}>
                      {isLiked ? '♥' : '♡'} {review.like_count || 0}
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}