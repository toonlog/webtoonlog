'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setMyUserId(userId);
    fetchCollection();
    fetchItems();
  }, [collectionId]);

  async function fetchCollection() {
    const res = await fetch(`/api/collections?collectionId=${collectionId}`);
    const data = await res.json();
    const found = Array.isArray(data) ? data.find((c: any) => c.id === collectionId) : null;
    setCollection(found);
  }

  async function fetchItems() {
    const res = await fetch(`/api/collections/items?collectionId=${collectionId}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  async function removeItem(itemId: string) {
    if (!confirm('이 웹툰을 컬렉션에서 제거할까요?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/collections/items?itemId=${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems(prev => prev.filter(i => i.id !== itemId));
  }

  if (loading) return <div className="p-8 text-center">로딩중...</div>;

  const isOwner = myUserId && collection?.user_id === myUserId;

  return (
    <main className="min-h-screen bg-gray-50 p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">{collection?.name || '컬렉션'}</h1>
          {collection && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${collection.is_public ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
              {collection.is_public ? '공개' : '비공개'}
            </span>
          )}
        </div>
        {collection?.description && <p className="text-gray-500 text-sm mt-1">{collection.description}</p>}
        <p className="text-gray-400 text-xs mt-2">웹툰 {items.length}개</p>
      </div>

      <div className="flex flex-col gap-4">
        {items.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
            아직 웹툰이 없어요! 웹툰 상세페이지에서 추가해보세요.
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            {item.thumbnailUrl ? (
              <img src={item.thumbnailUrl} alt={item.title} className="w-16 h-20 object-cover rounded-lg flex-shrink-0" />
            ) : (
              <div className="w-16 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1">
              <Link href={`/webtoon/${item.webtoon_id}`} className="font-bold hover:text-blue-500 transition">
                {item.title}
              </Link>
              <p className="text-gray-500 text-sm">{item.author}</p>
              <p className="text-blue-500 text-xs">{item.platform}</p>
            </div>
            {isOwner && (
              <button onClick={() => removeItem(item.id)}
                className="text-xs text-gray-400 hover:text-red-500 flex-shrink-0">제거</button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}