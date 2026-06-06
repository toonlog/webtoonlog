'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('전체');
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState(false);
  const [newImage, setNewImage] = useState('');

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
      body: JSON.stringify({ reviewId, rating: editRating, content: editContent }),
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
              className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              ✏️
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
          <div className="flex gap-2">
            <input className="border rounded-lg px-3 py-1 text-sm flex-1"
              placeholder="이미지 URL 입력"
              value={newImage} onChange={e => setNewImage(e.target.value)} />
            <button onClick={saveProfileImage} className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg">저장</button>
            <button onClick={() => setEditingImage(false)} className="text-sm text-gray-400">취소</button>
          </div>
        )}
      </div>

      {/* 컬렉션 */}
      {collections.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">내 컬렉션</h2>
            <Link href="/collections" className="text-xs text-blue-500 hover:underline">전체보기</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {collections.map(c => (
              <Link key={c.id} href={`/collections/${c.id}`}>
                <div className="border rounded-xl p-3 hover:bg-gray-50 transition">
                  <p className="font-bold text-sm text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{c.is_public ? '공개' : '비공개'}</p>
                </div>
              </Link>
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
                  <div className="flex items-center justify-between gap-1">
                    {review.webtoon_id ? (
                      <Link href={`/webtoon/${review.webtoon_id}`} className="font-bold text-blue-500 hover:underline text-sm truncate">
                        {review.webtoon_title || review.webtoon_id}
                      </Link>
                    ) : (
                      <span className="font-bold text-gray-400 text-sm">웹툰 정보 없음</span>
                    )}
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => togglePublic(review.id, review.is_public ?? true)}
                        className={`text-xs px-1.5 py-0.5 rounded-full border transition ${
                          review.is_public ?? true
                            ? 'text-green-600 border-green-300'
                            : 'text-gray-400 border-gray-300'
                        }`}>
                        {review.is_public ?? true ? '공개' : '비공개'}
                      </button>
                      <button onClick={() => { setEditingId(review.id); setEditRating(review.rating); setEditContent(review.content); }}
                        className="text-xs text-gray-400 hover:text-blue-500">수정</button>
                      <button onClick={() => deleteReview(review.id)}
                        className="text-xs text-gray-400 hover:text-red-500">삭제</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-400 text-sm">{'★'.repeat(review.rating)}</span>
                    <span className="text-gray-400 text-xs">{review.created_at}</span>
                  </div>
                </div>
              </div>
              {editingId === review.id ? (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setEditRating(n)}
                        className={`text-xl ${n <= editRating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                    ))}
                  </div>
                  <textarea className="border rounded p-2 text-sm w-full" rows={3}
                    value={editContent} onChange={e => setEditContent(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(review.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm">저장</button>
                    <button onClick={() => setEditingId(null)}
                      className="bg-gray-100 px-3 py-1 rounded text-sm">취소</button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 text-sm mt-1">{review.content}</p>
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
        <div className="max-w-2xl mx-auto px-4 py-3 flex flex-col gap-1">
          <button onClick={logout}
            className="w-full text-center text-sm text-red-400 hover:text-red-600 py-1">
            로그아웃
          </button>
          <button onClick={deleteAccount}
            className="w-full text-center text-xs text-gray-300 hover:text-red-400 py-1">
            회원 탈퇴
          </button>
        </div>
      </div>
    </main>
  );
}