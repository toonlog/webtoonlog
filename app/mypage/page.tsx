'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const statusList = ['읽는중', '완독', '읽고싶다', '보류'];
const statusColors: Record<string, string> = {
  '읽는중': 'bg-blue-100 text-blue-600',
  '완독': 'bg-green-100 text-green-600',
  '읽고싶다': 'bg-purple-100 text-purple-600',
  '보류': 'bg-gray-100 text-gray-500',
};

export default function MyPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'reviews' | 'status'>('reviews');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState('');
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const nick = localStorage.getItem('nickname');
    const uid = localStorage.getItem('userId');
    if (!token || !uid) { router.push('/login'); return; }
    setNickname(nick);
    setUserId(uid);
    fetchData(token, uid);
    fetchFollowCounts(uid);
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
    });
  }

  function refetch() {
    const token = localStorage.getItem('token')!;
    const uid = localStorage.getItem('userId')!;
    fetchData(token, uid);
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

  async function changeStatus(webtoonId: string, newStatus: string) {
    const token = localStorage.getItem('token');
    await fetch('/api/reading-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ webtoonId, status: newStatus }),
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

  async function deleteAccount() {
    if (!confirm('정말 탈퇴하시겠어요?\n리뷰, 읽기상태, 컬렉션 등 모든 데이터가 삭제됩니다.')) return;
    if (!confirm('마지막으로 한 번 더 확인해요. 정말 탈퇴하시겠어요?')) return;
    const token = localStorage.getItem('token');
    const uid = localStorage.getItem('userId');
    const res = await fetch(`/api/users/${uid}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      localStorage.removeItem('token');
      localStorage.removeItem('nickname');
      localStorage.removeItem('userId');
      window.dispatchEvent(new Event('authChange'));
      alert('탈퇴가 완료됐어요.');
      router.push('/');
    } else {
      alert('오류가 발생했어요');
    }
  }

  if (loading) return <div className="p-8 text-center">로딩중...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{nickname}</h1>
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span>팔로워 <strong className="text-gray-800">{followerCount}</strong></span>
              <span>팔로잉 <strong className="text-gray-800">{followingCount}</strong></span>
            </div>
          </div>
          {userId && (
            <Link href={`/users/${userId}`} className="text-sm text-blue-500 hover:underline">내 프로필</Link>
          )}
        </div>
      </div>

      <div className="flex mb-4 bg-white rounded-xl shadow p-1 gap-1">
        <button onClick={() => setTab('reviews')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === 'reviews' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
          내 리뷰 {reviews.length}
        </button>
        <button onClick={() => setTab('status')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === 'status' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
          읽기 상태 {statuses.length}
        </button>
      </div>

      {tab === 'reviews' && (
        <div className="bg-white rounded-xl shadow p-6">
          {reviews.length === 0 && <p className="text-gray-400">아직 작성한 리뷰가 없어요!</p>}
          {reviews.map(review => (
            <div key={review.id} className="border-b py-4 last:border-0">
              <div className="flex items-center justify-between mb-1">
                {review.webtoon_id ? (
                  <Link href={`/webtoon/${review.webtoon_id}`} className="font-bold text-blue-500 hover:underline text-sm">
                    {review.webtoon_title || review.webtoon_id}
                  </Link>
                ) : (
                  <span className="font-bold text-gray-400 text-sm">웹툰 정보 없음</span>
                )}
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(review.id); setEditRating(review.rating); setEditContent(review.content); }}
                    className="text-xs text-gray-400 hover:text-blue-500">수정</button>
                  <button onClick={() => deleteReview(review.id)}
                    className="text-xs text-gray-400 hover:text-red-500">삭제</button>
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
                <>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-400 text-sm">{'★'.repeat(review.rating)}</span>
                    <span className="text-gray-400 text-xs">{review.created_at}</span>
                  </div>
                  <p className="text-gray-700 text-sm mt-1">{review.content}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'status' && (
        <div className="bg-white rounded-xl shadow p-6">
          {statuses.length === 0 && <p className="text-gray-400">아직 저장한 읽기 상태가 없어요!</p>}
          {statuses.map(s => (
            <div key={s.id} className="border-b py-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
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
              <div className="flex gap-2 flex-wrap">
                {statusList.map(st => (
                  <button key={st} onClick={() => changeStatus(s.webtoon_id, st)}
                    className={`text-xs px-3 py-1 rounded-full border transition ${s.status === st ? statusColors[st] + ' border-current' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 탈퇴 */}
      <div className="mt-8 text-center">
        <button onClick={deleteAccount} className="text-xs text-gray-300 hover:text-red-400 transition">
          회원 탈퇴
        </button>
      </div>
    </main>
  );
}