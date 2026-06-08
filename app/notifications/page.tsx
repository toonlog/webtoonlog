'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TYPE_LABEL: Record<string, (n: any) => string> = {
  follow: (n) => `${n.actor_nickname}님이 팔로우했어요`,
  review_like: (n) => `${n.actor_nickname}님이 내 리뷰에 좋아요를 눌렀어요`,
  review_comment: (n) => `${n.actor_nickname}님이 내 리뷰에 댓글을 달았어요`,
  collection_like: (n) => `${n.actor_nickname}님이 내 컬렉션에 좋아요를 눌렀어요`,
  following_review: (n) => `${n.actor_nickname}님이 새 리뷰를 작성했어요`,
  following_collection: (n) => `${n.actor_nickname}님이 새 컬렉션을 만들었어요`,
};

function getLink(n: any) {
  if (n.type === 'follow') return `/users/${n.actor_id}`;
  if (n.type === 'review_like' || n.type === 'review_comment' || n.type === 'following_review') {
    return n.webtoon_id ? `/webtoon/${n.webtoon_id}` : '#';
  }
  if (n.type === 'collection_like' || n.type === 'following_collection') {
    return n.target_id ? `/collections/${n.target_id}` : '#';
  }
  return '#';
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) { router.push('/login'); return; }
    fetch(`/api/notifications?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        setNotifications(Array.isArray(data) ? data : []);
        setLoading(false);
        // 전체 읽음 처리
        if (Array.isArray(data)) {
          data.filter((n: any) => !n.is_read).forEach((n: any) => {
            fetch('/api/notifications', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notificationId: n.id }),
            });
          });
        }
      });
  }, []);

  if (loading) return <div className="p-8 text-center">로딩중...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-lg font-bold text-gray-900 mb-4">알람</h1>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
          아직 알람이 없어요
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
          {notifications.map(n => (
            <Link key={n.id} href={getLink(n)}
              className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition ${!n.is_read ? 'bg-blue-50 hover:bg-blue-50' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 flex-shrink-0 mt-0.5">
                {n.actor_nickname?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{TYPE_LABEL[n.type]?.(n) ?? n.type}</p>
                <p className="text-xs text-gray-400 mt-0.5">{n.created_at}</p>
              </div>
              {!n.is_read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}