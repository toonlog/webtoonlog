'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TagInput from '@/app/components/TagInput';
import ImageUpload from '@/app/components/ImageUpload';

function StarPicker({ rating, onChange }: { rating: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', cursor: 'pointer' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex' }}>
            <svg width={26} height={26} viewBox="0 0 24 24" onClick={() => onChange(i - 0.5)} style={{ cursor: 'pointer' }}>
              <defs>
                <linearGradient id={`mp-half-${i}`}>
                 <stop offset="50%" stopColor={rating >= i - 0.5 ? '#FBBF24' : '#D3D1C7'} />
                  <stop offset="50%" stopColor="#D3D1C7" />
                </linearGradient>
              </defs>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={rating >= i ? '#FBBF24' : rating >= i - 0.5 ? `url(#mp-half-${i})` : '#D3D1C7'} />
            </svg>
            <svg width={26} height={26} viewBox="0 0 24 24" onClick={() => onChange(i)} style={{ cursor: 'pointer', marginLeft: -26 }}>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="transparent" />
            </svg>
          </div>
        ))}
      </div>
      <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
}


function MiniCollectionCard({ c }: any) {
  const [previews, setPreviews] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/collections/items?collectionId=${c.id}&preview=true`)
      .then(r => r.json())
      .then(data => setPreviews(Array.isArray(data) ? data : []));
  }, [c.id]);

  return (
    <Link href={`/collections/${c.id}`}>
      <div className="border border-gray-200 rounded-xl overflow-hidden hover:bg-gray-50 transition">
        <div className="grid grid-cols-2 w-full" style={{ aspectRatio: '1' }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ aspectRatio: '1', overflow: 'hidden' }}>
              {previews[i]?.thumbnail_url ? (
                <img src={previews[i].thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
          ))}
        </div>
        <div className="p-2">
          <p className="font-bold text-xs text-gray-900 truncate">{c.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{c.is_public ? '공개' : '비공개'}</p>
        </div>
      </div>
    </Link>
  );
}

export default function MyPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'reviews' | 'status'>('reviews');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('전체');
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState(false);
const [newImage, setNewImage] = useState('');
  const [likedCollections, setLikedCollections] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const nick = localStorage.getItem('nickname');
    const uid = localStorage.getItem('userId');
    if (!token || !uid) { router.push('/login'); return; }
    setNickname(nick);
    setUserId(uid);
    fetchData(token, uid);
    fetchFollowCounts(uid);
fetchCollections(uid);
    fetchLikedCollections(uid);
  }, []);

  function fetchData(token: string, uid: string) {
    fetch(`/api/mypage?userId=${uid}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(data => {
      setReviews(data.reviews || []);
      setStatuses(data.statuses || []);
      setLoading(false);
    });
  }

  function fetchFollowCounts(uid: string) {
    fetch(`/api/users/${uid}`).then(r => r.json()).then(data => {
      setFollowerCount(data.followerCount || 0);
      setFollowingCount(data.followingCount || 0);
      setProfileImage(data.user?.profile_image || null);
    });
  }

  function fetchCollections(uid: string) {
    fetch(`/api/collections?userId=${uid}`)
      .then(r => r.json())
      .then(data => setCollections(Array.isArray(data) ? data.slice(0, 4) : []));
  }

async function fetchLikedCollections(uid: string) {
    const res = await fetch(`/api/collections/like?userId=${uid}`);
    const data = await res.json();
    setLikedCollections(Array.isArray(data) ? data : []);
  }

  function refetch() {
    const token = localStorage.getItem('token')!;
    const uid = localStorage.getItem('userId')!;
    fetchData(token, uid);
  }

  async function saveNickname() {
    if (!newNickname.trim()) return alert('닉네임을 입력해주세요!');
    const token = localStorage.getItem('token');
    const res = await fetch('/api/auth/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nickname: newNickname }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    localStorage.setItem('token', data.token);
    localStorage.setItem('nickname', data.nickname);
    setNickname(data.nickname);
    setEditingNickname(false);
    window.dispatchEvent(new Event('authChange'));
  }

async function saveProfileImage() {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/auth/update', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ profile_image: newImage }),
  });
  const data = await res.json();
  if (!res.ok) return alert(data.error);
  setProfileImage(newImage);
  setEditingImage(false);
  window.dispatchEvent(new Event('authChange'));
}

  async function deleteReview(reviewId: string) {
    if (!confirm('리뷰를 삭제할까요?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/reviews?reviewId=${reviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    refetch();
  }

  async function saveEdit(reviewId: string) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/reviews', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reviewId, rating: editRating, content: editContent, tags: editTags }),
  });
  if (res.ok) { setEditingId(null); refetch(); }
}

  async function togglePublic(reviewId: string, currentPublic: boolean) {
    const token = localStorage.getItem('token');
    await fetch('/api/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reviewId, is_public: !currentPublic }),
    });
    refetch();
  }

  async function deleteStatus(webtoonId: string) {
    if (!confirm('읽기 상태를 삭제할까요?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/reading-status?webtoonId=${webtoonId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    refetch();
  }

  async function changeStatus(webtoonId: string, newStatus: string) {
    const token = localStorage.getItem('token');
    await fetch('/api/reading-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ webtoonId, status: newStatus }),
    });
    refetch();
  }

  async function deleteAccount() {
    if (!confirm('정말 탈퇴할까요?\n지금까지 작성한 리뷰, 읽기 상태, 컬렉션이 모두 삭제됩니다.')) return;
    if (!confirm('마지막 확인입니다. 정말 탈퇴하시겠어요?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch('/api/auth/delete', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return alert('오류가 발생했어요');
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    localStorage.removeItem('userId');
    window.dispatchEvent(new Event('authChange'));
    router.push('/');
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    localStorage.removeItem('userId');
    window.dispatchEvent(new Event('authChange'));
    router.push('/');
  }

  const statusList = ['읽는중', '완독', '읽고싶다', '보류'];
  const filteredStatuses = statusFilter === '전체' ? statuses : statuses.filter(s => s.status === statusFilter);

  if (loading) return <div className="p-8 text-center">로딩중...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-2xl mx-auto pb-24">

      {/* 프로필 */}
      <div className="bg-white rounded-xl shadow p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-shrink-0">
            {profileImage ? (
              <img src={profileImage} alt="프로필" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl">
                {nickname?.[0]?.toUpperCase()}
              </div>
            )}
            <button onClick={() => { setEditingImage(true); setNewImage(profileImage || ''); }}
  className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:border-gray-400 transition">
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
</button>
          </div>
          <div className="flex-1 min-w-0">
            {editingNickname ? (
              <div className="flex flex-wrap items-center gap-2">
                <input className="border rounded-lg px-2 py-1 text-sm w-28"
                  value={newNickname} onChange={e => setNewNickname(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveNickname()} />
                <button onClick={saveNickname} className="text-xs bg-blue-500 text-white px-2 py-1 rounded-lg">저장</button>
                <button onClick={() => setEditingNickname(false)} className="text-xs text-gray-400">취소</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 truncate">{nickname}</h1>
                <button onClick={() => { setEditingNickname(true); setNewNickname(nickname || ''); }}
                  className="text-xs text-gray-400 hover:text-blue-500 flex-shrink-0">수정</button>
              </div>
            )}
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span>팔로워 <strong className="text-gray-800">{followerCount}</strong></span>
              <span>팔로잉 <strong className="text-gray-800">{followingCount}</strong></span>
            </div>
          </div>
        </div>
{editingImage && (
          <div className="flex flex-col gap-2">
            <ImageUpload onUpload={(url) => { setNewImage(url); }} />
            {newImage && <img src={newImage} alt="미리보기" className="w-16 h-16 rounded-full object-cover" />}
            <div className="flex gap-2">
              <button onClick={saveProfileImage} disabled={!newImage}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg disabled:opacity-50">저장</button>
              <button onClick={() => setEditingImage(false)} className="text-sm text-gray-400">취소</button>
            </div>
          </div>
        )}
      </div>

      {/* 컬렉션 */}
    <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">내 컬렉션</h2>
          <button
            onClick={() => router.push('/collections')}
            className="text-xs text-white px-3 py-1.5 rounded-lg border-none"
            style={{ background: '#3B82F6' }}>
            + 컬렉션 추가
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {collections.map(c => (
            <MiniCollectionCard key={c.id} c={c} />
          ))}
        </div>
        {collections.length > 0 && (
          <Link href="/collections" className="text-xs text-blue-500 hover:underline mt-2 block">전체보기</Link>
        )}
      </div>

    {/* 좋아요한 컬렉션 */}
      {likedCollections.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <h2 className="font-bold text-gray-900 mb-3">좋아요한 컬렉션</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {likedCollections.map(c => (
              <MiniCollectionCard key={c.id} c={c} />
            ))}
          </div>
        </div>
      )}

      {/* 탭 */}
      <div className="flex mb-4 bg-white rounded-xl shadow p-1 gap-1">
        <button onClick={() => setTab('reviews')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === 'reviews' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
          내 리뷰 {reviews.length}개
        </button>
        <button onClick={() => setTab('status')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === 'status' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
          읽기 상태 {statuses.length}개
        </button>
      </div>

    {/* 내 리뷰 */}
      {tab === 'reviews' && (
        <div className="bg-white rounded-xl shadow p-6">
          {reviews.length === 0 && <p className="text-gray-400">아직 작성한 리뷰가 없어요!</p>}
          {reviews.map(review => (
            <div key={review.id} className="border-b py-4 last:border-0">
              <div className="flex items-center gap-3 mb-2">
                {review.thumbnail_url ? (
                  <img src={review.thumbnail_url} alt={review.webtoon_title} className="w-10 h-14 object-cover rounded flex-shrink-0" />
                ) : (
                  <div className="w-10 h-14 bg-gray-200 rounded flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {review.webtoon_id ? (
                      <Link href={`/webtoon/${review.webtoon_id}`} className="font-bold text-blue-500 hover:underline text-sm truncate">
                        {review.webtoon_title || review.webtoon_id}
                      </Link>
                    ) : (
                      <span className="font-bold text-gray-400 text-sm">웹툰 정보 없음</span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={(review.is_public ?? true)
                        ? { background: '#EAF3DE', color: '#3B6D11' }
                        : { background: '#F1EFE8', color: '#5F5E5A' }}>
                      {(review.is_public ?? true) ? '공개' : '비공개'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-yellow-400 text-sm">{'★'.repeat(Math.floor(review.rating))}{review.rating % 1 ? '½' : ''}</span>
                    <span className="text-xs text-gray-600 font-medium">{review.rating.toFixed(1)}</span>
                    <span className="text-gray-400 text-xs">{review.created_at}</span>
                    <div className="flex gap-3 flex-shrink-0 ml-auto">
                      <button
                        onClick={() => { setEditingId(review.id); setEditRating(review.rating); setEditContent(review.content); setEditTags(review.tags || ''); }}
                        style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: '#9ca3af', cursor: 'pointer' }}>수정</button>
                      <button
                        onClick={() => deleteReview(review.id)}
                        style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: '#E24B4A', cursor: 'pointer' }}>삭제</button>
                    </div>
                  </div>
                </div>
              </div>
              {editingId === review.id ? (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center justify-between">
                    <StarPicker rating={editRating} onChange={setEditRating} />
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs" style={{ color: (review.is_public ?? true) ? '#3B82F6' : '#888780' }}>
                        {(review.is_public ?? true) ? '공개' : '나만보기'}
                      </span>
                      <div
                        onClick={() => togglePublic(review.id, review.is_public ?? true)}
                        style={{ width: 34, height: 19, borderRadius: 10, background: (review.is_public ?? true) ? '#3B82F6' : '#B4B2A9', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', transition: 'background 0.2s', flexShrink: 0 }}>
                        <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#fff', transform: (review.is_public ?? true) ? 'translateX(15px)' : 'translateX(0)', transition: 'transform 0.2s' }} />
                      </div>
                    </div>
                  </div>
                  <textarea
                    style={{ background: '#F9F9F9', border: '0.5px solid #EBEBEB', borderRadius: 7, padding: '5px 8px', fontSize: 12, color: '#1a1a1a', width: '100%', resize: 'none', minHeight: 64, lineHeight: 1.5 }}
                    rows={3} value={editContent} onChange={e => setEditContent(e.target.value)} />
                  <TagInput value={editTags} onChange={setEditTags} />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)}
                      style={{ fontSize: 13, padding: '6px 16px', borderRadius: 6, border: 'none', background: '#E5E7EB', color: '#374151', cursor: 'pointer' }}>취소</button>
                    <button onClick={() => saveEdit(review.id)}
                      style={{ fontSize: 13, padding: '6px 16px', borderRadius: 6, border: 'none', background: '#3B82F6', color: 'white', cursor: 'pointer' }}>저장</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 text-sm mt-1">{review.content}</p>
                  {review.tags && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {review.tags.split(',').map((t: string) => t.trim()).filter(Boolean).map((t: string) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: '#EEEDFE', color: '#534AB7' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 읽기 상태 */}
      {tab === 'status' && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex gap-2 flex-wrap mb-4">
            {['전체', ...statusList].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs border transition ${statusFilter === s ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}>
                {s}
              </button>
            ))}
          </div>
          {filteredStatuses.length === 0 && <p className="text-gray-400">해당 상태의 작품이 없어요!</p>}
          {filteredStatuses.map(s => (
            <div key={s.id} className="border-b py-4 last:border-0">
              <div className="flex items-center gap-3 mb-2">
                {s.thumbnail_url ? (
                  <img src={s.thumbnail_url} alt={s.webtoon_title} className="w-10 h-14 object-cover rounded flex-shrink-0" />
                ) : (
                  <div className="w-10 h-14 bg-gray-200 rounded flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    {s.webtoon_id ? (
                      <Link href={`/webtoon/${s.webtoon_id}`} className="font-bold text-blue-500 hover:underline text-sm">
                        {s.webtoon_title || s.webtoon_id}
                      </Link>
                    ) : (
                      <span className="font-bold text-gray-400 text-sm">웹툰 정보 없음</span>
                    )}
                    <button onClick={() => deleteStatus(s.webtoon_id)}
                      className="text-xs text-gray-400 hover:text-red-500">삭제</button>
                  </div>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {statusList.map(st => (
                      <button key={st} onClick={() => changeStatus(s.webtoon_id, st)}
                        className={`px-3 py-1 rounded-full text-xs border transition ${s.status === st ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}>
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
  <div className="max-w-2xl mx-auto px-4 py-2">
    <button onClick={deleteAccount}
      className="w-full text-center text-xs text-gray-300 hover:text-red-400 py-1">
      회원 탈퇴
    </button>
  </div>
</div>
    </main>
  );
}