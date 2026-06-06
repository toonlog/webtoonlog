'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TagInput from '@/app/components/TagInput';

function WebtoonCollectionSection({ collections }: { collections: any[] }) {
  const [previews, setPreviews] = useState<Record<string, any[]>>({});
  const SHOW = 5;
  const visible = collections.slice(0, SHOW);

  useEffect(() => {
    visible.forEach(c => {
      fetch(`/api/collections/items?collectionId=${c.id}&preview=true`)
        .then(r => r.json())
        .then(data => setPreviews(prev => ({ ...prev, [c.id]: Array.isArray(data) ? data : [] })));
    });
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-sm font-bold mb-3">이 작품이 담긴 컬렉션</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {visible.map(c => (
          <Link key={c.id} href={`/collections/${c.id}`} className="flex-shrink-0 w-28">
            <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition">
              <div className="grid grid-cols-2 w-full" style={{ aspectRatio: '1' }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ aspectRatio: '1', overflow: 'hidden' }}>
                    {previews[c.id]?.[i]?.thumbnail_url ? (
                      <img src={previews[c.id][i].thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                  </div>
                ))}
              </div>
              <div className="p-2">
                <p className="font-bold text-xs text-gray-900 truncate">{c.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {collections.length > SHOW && (
        <button className="block w-full text-center text-xs text-blue-500 mt-3 hover:underline">
          더보기 ({collections.length - SHOW}개 더) ▾
        </button>
      )}
    </div>
  );
}

function getAuth() {
  return {
    token: localStorage.getItem('token'),
    nickname: localStorage.getItem('nickname'),
    userId: localStorage.getItem('userId'),
  };
}

function StarDisplay({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => {
        const fill = rating >= i ? '#E9A800' : rating >= i - 0.5 ? 'url(#half)' : '#D3D1C7';
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24">
            {i === 1 && (
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor="#E9A800" />
                  <stop offset="50%" stopColor="#D3D1C7" />
                </linearGradient>
              </defs>
            )}
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={fill} />
          </svg>
        );
      })}
      <span style={{ fontSize: size - 2, color: 'var(--color-text-secondary)', marginLeft: 2 }}>{rating.toFixed(1)}</span>
    </div>
  );
}

function StarPicker({ rating, onChange }: { rating: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: '1px', cursor: 'pointer' }}>
        {[1, 2, 3, 4, 5].map(i => {
          const filled = rating >= i ? '#E9A800' : '#D3D1C7';
          const half = rating >= i - 0.5 && rating < i;
          return (
          <div key={i} style={{ position: 'relative', width: 22, height: 22 }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                onChange(x < rect.width / 2 ? i - 0.5 : i);
              }}>
              <svg width={22} height={22} viewBox="2 2 20 20">
                <defs>
                  <linearGradient id={`half-${i}`}>
                    <stop offset="50%" stopColor="#E9A800" />
                    <stop offset="50%" stopColor="#D3D1C7" />
                  </linearGradient>
                </defs>
                <polygon
                  points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  fill={rating >= i ? '#E9A800' : half ? `url(#half-${i})` : '#D3D1C7'} />
              </svg>
            </div>
          );
        })}
      </div>
      <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function WebtoonPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [webtoon, setWebtoon] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<'latest' | 'likes'>('latest');
  const [readStatus, setReadStatus] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [auth, setAuth] = useState<{ token: string | null; nickname: string | null; userId: string | null }>({ token: null, nickname: null, userId: null });
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);
  const [webtoonCollections, setWebtoonCollections] = useState<any[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showMoreReviews, setShowMoreReviews] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);

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
      body: JSON.stringify({ webtoonId: id, rating, content, tags, is_public: isPublic }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return alert(data.error);
    setContent(''); setRating(5); setTags(''); setIsPublic(true);
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
  const review = reviews.find(r => r.id === reviewId);
  const res = await fetch('/api/reviews', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
    body: JSON.stringify({ reviewId, rating: editRating, content: editContent, tags: editTags, is_public: review?.is_public ?? true }),
  });
if (res.ok) {
    setEditingId(null);
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, rating: editRating, content: editContent, tags: editTags, is_public: review?.is_public ?? true } : r));
  }
}

  async function toggleReviewPublic(reviewId: string, current: boolean) {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_public: !current } : r));
  }

  const statusList = ['읽는중', '완독', '읽고싶다', '보류'];
  if (!webtoon) return <div className="p-8 text-center">로딩중...</div>;

  const myReview = reviews.find(r => r.userId === auth.userId);
  const genres = webtoon.genre ? webtoon.genre.split(',').map((g: string) => g.trim()).filter(Boolean) : [];
  const platforms = Array.isArray(webtoon.platform) ? webtoon.platform : webtoon.platform ? [webtoon.platform] : [];

  const tagCount: Record<string, number> = {};
  reviews.forEach(r => {
    if (!r.tags) return;
    r.tags.split(',').map((t: string) => t.trim()).filter(Boolean).forEach((t: string) => {
      tagCount[t] = (tagCount[t] || 0) + 1;
    });
  });
  const sortedTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
  const visibleTags = showAllTags ? sortedTags : sortedTags.slice(0, 5);

  const sortedReviews = [...reviews].sort((a, b) =>
    sortOrder === 'likes'
      ? (b.likes || 0) - (a.likes || 0)
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const INITIAL = 5;
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(sortedReviews.length / PAGE_SIZE);
  const displayedReviews = !showMoreReviews
    ? sortedReviews.slice(0, INITIAL)
    : sortedReviews.slice((reviewPage - 1) * PAGE_SIZE, reviewPage * PAGE_SIZE);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-2xl mx-auto">

      {/* 작품 정보 */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="flex gap-3">
          {/* 썸네일 */}
          <div className="flex-shrink-0 w-20">
            {webtoon.thumbnail_url ? (
              <img src={webtoon.thumbnail_url} alt={webtoon.title}
                className="w-20 rounded-lg object-cover"
                style={{ aspectRatio: '8/11' }} />
            ) : (
              <div className="w-20 bg-gray-200 rounded-lg" style={{ aspectRatio: '8/11' }} />
            )}
          </div>
          {/* 정보 */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-base font-bold text-gray-900 leading-snug" style={{ wordBreak: 'keep-all' }}>{webtoon.title}</h1>
              {auth.token && (
                <div className="relative flex-shrink-0">
                  <button onClick={() => setShowCollectionMenu(!showCollectionMenu)}
                    className="text-xs px-3 py-1.5 rounded-lg border-none text-white flex-shrink-0"
                    style={{ background: '#3B82F6', lineHeight: 1.2 }}>
                    + 컬렉션
                  </button>
                  {showCollectionMenu && (
                    <div className="absolute right-0 top-8 bg-white shadow-lg rounded-xl p-2 w-44 z-10 border border-gray-100">
                      {collections.length === 0 ? (
                        <Link href="/collections" className="block text-sm text-blue-500 p-2 hover:bg-gray-50 rounded-lg">컬렉션 만들기</Link>
                      ) : collections.map(c => (
                        <button key={c.id} onClick={() => addToCollection(c.id)}
                          className="w-full text-left text-sm px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-700">
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">{webtoon.author}</p>
            {avgRating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-xs">★ {avgRating}</span>
                <span className="text-xs text-gray-400">({reviews.length}개)</span>
              </div>
            )}
            {/* 플랫폼 */}
            <div className="flex flex-wrap gap-1">
              {platforms.map((p: string) => (
                <span key={p}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#EBF5FF', color: '#185FA5' }}>
                  {p}
                </span>
              ))}
            </div>
            {/* 장르 */}
            <div className="flex flex-wrap gap-1">
              {genres.map((g: string) => (
                <Link key={g} href={`/genre/${encodeURIComponent(g)}`}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#F1EFE8', color: '#5F5E5A' }}>
                  {g}
                </Link>
              ))}
            </div>
            {/* 연재상태 */}
            {webtoon.status && (
              <div>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#EAF3DE', color: '#3B6D11' }}>
                  {webtoon.status}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 유저 태그 */}
        {sortedTags.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">유저 태그</p>
            <div className="flex flex-wrap gap-1.5">
              {visibleTags.map(([tag, count]) => (
                <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#EEEDFE', color: '#534AB7' }}>
                  #{tag} {count}
                </Link>
              ))}
              {sortedTags.length > 5 && (
                <button onClick={() => setShowAllTags(!showAllTags)}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {showAllTags ? '접기' : `+${sortedTags.length - 5}개 더보기`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 읽기 상태 */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h2 className="text-sm font-bold mb-3">읽기 상태</h2>
        {!auth.token ? (
          <p className="text-gray-400 text-sm">
            <button onClick={() => router.push('/login')} className="text-blue-500 underline">로그인</button> 후 상태를 저장할 수 있어요
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {statusList.map(s => (
              <button key={s} onClick={() => submitStatus(s)}
                className="py-1.5 rounded-full text-xs border transition"
                style={readStatus === s
                  ? { background: '#3B82F6', color: '#fff', border: 'none' }
                  : { background: 'transparent', color: 'var(--color-text-primary)', borderColor: '#D3D1C7' }}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 리뷰 작성 */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold">리뷰 작성</h2>
          {auth.token && !myReview && (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: isPublic ? '#3B82F6' : '#888780' }}>
                {isPublic ? '공개' : '나만보기'}
              </span>
              <div
                onClick={() => setIsPublic(!isPublic)}
                style={{
                  width: 36, height: 20, borderRadius: 10,
                  background: isPublic ? '#3B82F6' : '#B4B2A9',
                  cursor: 'pointer', position: 'relative',
                  transition: 'background 0.2s', display: 'flex', alignItems: 'center', padding: '2px'
                }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  transform: isPublic ? 'translateX(16px)' : 'translateX(0)',
                  transition: 'transform 0.2s'
                }} />
              </div>
            </div>
          )}
        </div>
        {!auth.token ? (
          <p className="text-gray-400 text-sm">
            <button onClick={() => router.push('/login')} className="text-blue-500 underline">로그인</button> 후 리뷰를 작성할 수 있어요
          </p>
        ) : myReview ? (
          <p className="text-gray-400 text-sm">이미 리뷰를 작성했어요. 아래에서 수정할 수 있어요!</p>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-2">{auth.nickname} 님으로 작성됩니다</p>
            <StarPicker rating={rating} onChange={setRating} />
            <textarea className="w-full border rounded-lg p-2 mt-2 mb-2 text-sm" rows={3}
              placeholder="리뷰를 작성해주세요" value={content} onChange={e => setContent(e.target.value)} />
 <TagInput value={tags} onChange={setTags} placeholder="태그 (쉼표로 구분 - 예. 순애, 계략남주, 조폭)" />
            <button onClick={submitReview} disabled={loading}
              className="px-4 py-2 rounded-lg text-sm text-white border-none"
              style={{ background: '#3B82F6' }}>
              {loading ? '등록 중...' : '등록'}
            </button>
          </>
        )}
      </div>

      {/* 리뷰 목록 */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">리뷰 {reviews.length}개</h2>
            {avgRating && (
              <span className="text-xs text-gray-400">· 평균 <span className="text-yellow-500 font-bold">★{avgRating}</span></span>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            {['latest', 'likes'].map(o => (
              <button key={o} onClick={() => setSortOrder(o as any)}
                className="text-xs px-3 py-1 rounded-full border transition"
                style={sortOrder === o
                  ? { background: '#3B82F6', color: '#fff', border: 'none' }
                  : { background: 'transparent', color: '#888', borderColor: '#D3D1C7' }}>
                {o === 'latest' ? '최신순' : '좋아요순'}
              </button>
            ))}
          </div>
        </div>

        {reviews.length === 0 && <p className="text-gray-400 text-sm">아직 리뷰가 없어요!</p>}

        {displayedReviews.map((review, idx) => (
          <div key={review.id} className={idx > 0 ? 'border-t border-gray-100 pt-3 mt-3' : ''}>
           {editingId === review.id ? (
 <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <StarPicker rating={editRating} onChange={setEditRating} />
                 <div onClick={() => toggleReviewPublic(review.id, review.is_public??true)}
                    style={{ width:28, height:16, borderRadius:8, background:(review.is_public??true)?'#3B82F6':'#B4B2A9', cursor:'pointer', display:'flex', alignItems:'center', padding:'2px', transition:'background 0.2s', flexShrink:0 }}>
                    <div style={{ width:12, height:12, borderRadius:'50%', background:'#fff', transform:(review.is_public??true)?'translateX(12px)':'translateX(0)', transition:'transform 0.2s' }} />
                  </div>
                  <span className="text-xs" style={{ color:(review.is_public??true)?'#3B82F6':'#888780' }}>
                    {(review.is_public??true)?'공개':'나만보기'}
                  </span>
                </div>
                <textarea className="border rounded-lg p-2 text-sm w-full" rows={3}
                  value={editContent} onChange={e => setEditContent(e.target.value)} />
              <TagInput value={editTags} onChange={setEditTags} />

                <div className="flex gap-2">
                  <button onClick={() => saveEdit(review.id)}
                    className="px-3 py-1 rounded-lg text-sm text-white border-none"
                    style={{ background: '#3B82F6' }}>저장</button>
                  <button onClick={() => setEditingId(null)}
                    className="bg-gray-100 px-3 py-1 rounded-lg text-sm">취소</button>
                </div>
              </div>
) : (
              <>
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {review.profileImage ? (
                      <img src={review.profileImage} alt={review.nickname}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                        {review.nickname?.[0]?.toUpperCase()}
                      </div>
                    )}
                    {review.userId ? (
                      <Link href={`/users/${review.userId}`} className="font-bold text-sm hover:text-blue-500">
                        {review.nickname}
                      </Link>
                    ) : (
                      <span className="font-bold text-sm">{review.nickname}</span>
                    )}
                <StarDisplay rating={review.rating} size={13} />
                   {review.readStatus && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: '#EBF5FF', color: '#185FA5' }}>
                        {review.readStatus}
                      </span>
                    )}
                    {review.userId === auth.userId && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={(review.is_public ?? true)
                          ? { background: '#D1FAE5', color: '#059669' }
                          : { background: '#F1EFE8', color: '#5F5E5A' }}>
                        {(review.is_public ?? true) ? '공개' : '비공개'}
                      </span>
                    )}
                  </div>
                  {review.userId === auth.userId && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => { setEditingId(review.id); setEditRating(review.rating); setEditContent(review.content); setEditTags(review.tags || ''); }}
                        className="text-xs text-gray-400 hover:text-blue-500">수정</button>
                      <button onClick={() => deleteReview(review.id)}
                        className="text-xs text-gray-400 hover:text-red-500">삭제</button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-1">{review.content}</p>
                {review.tags && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {review.tags.split(',').map((t: string) => t.trim()).filter(Boolean).map((t: string) => (
                      <Link key={t} href={`/tag/${encodeURIComponent(t)}`}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: '#EEEDFE', color: '#534AB7' }}>
                        #{t}
                      </Link>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400">{review.created_at}</p>
              </>
            )}
          </div>
        ))}

        {!showMoreReviews && sortedReviews.length > INITIAL && (
          <button onClick={() => { setShowMoreReviews(true); setReviewPage(1); }}
            className="w-full mt-3 pt-3 border-t border-gray-100 text-sm text-blue-500">
            더보기 ({sortedReviews.length - INITIAL}개) ▾
          </button>
        )}
        {showMoreReviews && totalPages > 1 && (
          <div className="flex justify-center gap-1 mt-4 pt-3 border-t border-gray-100">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setReviewPage(page)}
                className="w-8 h-8 rounded-full text-sm transition"
                style={reviewPage === page
                  ? { background: '#3B82F6', color: '#fff' }
                  : { background: 'transparent', color: '#888' }}>
                {page}
              </button>
            ))}
            {reviewPage < totalPages && (
              <button onClick={() => setReviewPage(p => p + 1)}
                className="w-8 h-8 rounded-full text-sm text-gray-500">
                &gt;
              </button>
            )}
          </div>
        )}
      </div>

      {/* 이 작품이 담긴 컬렉션 */}
      {webtoonCollections.length > 0 && (
        <WebtoonCollectionSection collections={webtoonCollections} />
      )}
    </main>
  );
}