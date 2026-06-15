'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserPage() {
  const params = useParams();
  const router = useRouter();
  const targetUserId = params.id as string;

  const [targetUser, setTargetUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [tab, setTab] = useState<'reviews' | 'status'>('reviews');
  const [loading, setLoading] = useState(true);
const [myUserId, setMyUserId] = useState<string | null>(null);
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null);
  const [followList, setFollowList] = useState<any[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setMyUserId(userId);
    fetchAll(userId);
  }, [targetUserId]);

  async function fetchAll(myId: string | null) {
    const [userData, followData] = await Promise.all([
      fetch(`/api/users/${targetUserId}`).then(r => r.json()),
      myId ? fetch(`/api/follow?followerId=${myId}&followingId=${targetUserId}`).then(r => r.json()) : Promise.resolve({ isFollowing: false }),
    ]);

    setTargetUser(userData.user);
    setReviews(userData.reviews || []);
    setStatuses(userData.statuses || []);
    setFollowerCount(userData.followerCount || 0);
    setFollowingCount(userData.followingCount || 0);
    setIsFollowing(followData.isFollowing);
    setLoading(false);
  }

async function fetchFollowList(type: 'followers' | 'following') {
    const res = await fetch(`/api/follow?userId=${targetUserId}&type=${type}`);
    const data = await res.json();
    setFollowList(Array.isArray(data) ? data : []);
    setFollowModal(type);
  }

 async function toggleFollow() {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    const res = await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ followingId: targetUserId }),
    });
    const data = await res.json();
    if (res.ok) {
      const nowFollowing = data.isFollowing;
      setIsFollowing(nowFollowing);
      setFollowerCount(prev => nowFollowing ? prev + 1 : prev - 1);
    }
  }

  if (loading) return <div className="p-8 text-center">로딩중...</div>;
  if (!targetUser) return <div className="p-8 text-center">유저를 찾을 수 없어요</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-8 max-w-2xl mx-auto">
    <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex items-center gap-3">
          {targetUser.profile_image ? (
            <img src={targetUser.profile_image} alt="프로필" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl flex-shrink-0">
              {targetUser.nickname?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
      <h1 className="text-lg font-bold text-gray-900 truncate">{targetUser.nickname}</h1>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <button onClick={() => fetchFollowList('followers')} className="hover:text-blue-500 transition">
                팔로워 <strong className="text-gray-800">{followerCount}</strong>
              </button>
              <button onClick={() => fetchFollowList('following')} className="hover:text-blue-500 transition">
                팔로잉 <strong className="text-gray-800">{followingCount}</strong>
              </button>
            </div>
          </div>
          {myUserId && myUserId !== targetUserId && (
 <button onClick={toggleFollow}
              className={`px-3 py-1.5 rounded-lg text-xs transition flex-shrink-0 ${
                isFollowing
                  ? 'bg-gray-100 text-gray-700 font-medium hover:font-bold'
                  : 'bg-blue-500 text-white font-medium hover:bg-blue-600'
              }`}>
              {isFollowing ? '✓ 팔로잉' : '팔로우'}
            </button>
          )}
          {myUserId === targetUserId && (
            <Link href="/mypage" className="text-sm text-blue-500 hover:underline">마이페이지로</Link>
          )}
    </div>
      </div>

      {reviews.length > 0 && (() => {
        const genreCount: Record<string, number> = {};
        reviews.forEach(r => {
          if (!r.genre) return;
          r.genre.split(',').map((g: string) => g.trim()).filter(Boolean).forEach((g: string) => {
            genreCount[g] = (genreCount[g] || 0) + 1;
          });
        });
        const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g]) => g);

        const tagCount: Record<string, number> = {};
        reviews.forEach(r => {
          if (!r.tags) return;
          r.tags.split(',').map((t: string) => t.trim()).filter(Boolean).forEach((t: string) => {
            tagCount[t] = (tagCount[t] || 0) + 1;
          });
        });
        const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);

        if (topGenres.length === 0 && topTags.length === 0) return null;

        return (
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <h2 className="font-bold text-gray-900 mb-3">취향 분석</h2>
            <div className="flex flex-col gap-3">
              {topGenres.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">장르 선호 Top 3</p>
                  <div className="flex gap-2 flex-wrap">
                    {topGenres.map((g, i) => (
                      <span key={g} className="text-xs px-3 py-1 rounded-full"
                        style={{ background: '#F1EFE8', color: '#5F5E5A' }}>
                        {i + 1}. {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {topTags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">태그 선호 Top 3</p>
                  <div className="flex gap-2 flex-wrap">
                    {topTags.map((t, i) => (
                      <span key={t} className="text-xs px-3 py-1 rounded-full"
                        style={{ background: '#EEEDFE', color: '#534AB7' }}>
                        {i + 1}. #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <div className="flex mb-4 bg-white rounded-xl shadow p-1 gap-1">
        <button onClick={() => setTab('reviews')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === 'reviews' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
          리뷰 {reviews.length}개
        </button>
        <button onClick={() => setTab('status')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === 'status' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
          읽기 상태 {statuses.length}개
        </button>
      </div>

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
                <div>
                  {review.webtoon_id ? (
                    <Link href={`/webtoon/${review.webtoon_id}`} className="font-bold text-blue-500 hover:underline text-sm">
                      {review.webtoon_title || review.webtoon_id}
                    </Link>
                  ) : (
                    <span className="font-bold text-gray-400 text-sm">웹툰 정보 없음</span>
                  )}
               <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-400 text-sm">{'★'.repeat(Math.floor(review.rating))}{review.rating % 1 ? '½' : ''}</span>
                    <span className="text-gray-600 text-xs font-medium">{review.rating?.toFixed(1)}</span>
                    <span className="text-gray-400 text-xs">{review.created_at}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 text-sm mt-1">{review.content}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'status' && (
        <div className="bg-white rounded-xl shadow p-6">
          {statuses.length === 0 && <p className="text-gray-400">아직 저장한 읽기 상태가 없어요!</p>}
          {statuses.map(s => (
            <div key={s.id} className="border-b py-4 last:border-0 flex items-center justify-between">
              {s.webtoon_id ? (
                <Link href={`/webtoon/${s.webtoon_id}`} className="font-bold text-blue-500 hover:underline text-sm">
                  {s.webtoon_title || s.webtoon_id}
                </Link>
              ) : (
                <span className="font-bold text-gray-400 text-sm">웹툰 정보 없음</span>
              )}
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                s.status === '완독' ? 'bg-green-100 text-green-600' :
                s.status === '읽는중' ? 'bg-blue-100 text-blue-600' :
                s.status === '읽고싶다' ? 'bg-purple-100 text-purple-600' :
                'bg-gray-100 text-gray-500'
              }`}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      )}
  {followModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
          onClick={() => setFollowModal(null)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm">{followModal === 'followers' ? '팔로워' : '팔로잉'}</h2>
              <button onClick={() => setFollowModal(null)} className="text-gray-400 text-sm">✕</button>
            </div>
            {followList.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">목록이 없어요</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                {followList.map((u: any) => (
                  <button key={u.id} onClick={() => { router.push(`/users/${u.id}`); setFollowModal(null); }}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg w-full text-left">
                    {u.profile_image ? (
                      <img src={u.profile_image} alt={u.nickname} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                        {u.nickname?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-800">{u.nickname}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}