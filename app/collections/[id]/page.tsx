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
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setMyUserId(userId);
    fetchCollection();
    fetchItems();
  }, [collectionId]);

  async function fetchCollection() {
    const userId = localStorage.getItem('userId');
    const res = await fetch(`/api/collections?userId=${userId}`);
    const data = await res.json();
    const found = Array.isArray(data) ? data.find((c: any) => c.id === collectionId) : null;
    if (!found) {
      const pubRes = await fetch(`/api/collections`);
      const pubData = await pubRes.json();
      setCollection(pubData.find((c: any) => c.id === collectionId) || null);
    } else {
      setCollection(found);
    }
  }

  async function fetchItems() {
    const res = await fetch(`/api/collections/items?collectionId=${collectionId}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  async function searchWebtoons(q: string) {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const res = await fetch(`/?q=${encodeURIComponent(q)}`);
    // API로 검색
    const apiRes = await fetch(`/api/webtoons?q=${encodeURIComponent(q)}`);
    const data = await apiRes.json();
    setSearchResults(data);
    setSearching(false);
  }

  async function addWebtoon(webtoonId: string) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/collections/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ collectionId, webtoonId }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    fetchItems();
    setSearchQuery('');
    setSearchResults([]);
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

        {isOwner && (
          <button onClick={() => setShowSearch(!showSearch)}
            className="mt-3 text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
            + 웹툰 추가
          </button>
        )}
      </div>

      {/* 웹툰 검색 추가 */}
      {isOwner && showSearch && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-bold mb-3 text-sm">웹툰 검색해서 추가</h2>
          <input
            className="w-full border rounded-lg p-3 text-sm mb-3"
            placeholder="제목 또는 작가 검색..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              searchWebtoons(e.target.value);
            }}
          />
          {searching && <p className="text-gray-400 text-sm">검색 중...</p>}
          <div className="flex flex-col gap-2">
            {searchResults.map((w: any) => (
              <div key={w.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {w.thumbnail_url ? (
                    <img src={w.thumbnail_url} alt={w.title} className="w-8 h-10 object-cover rounded flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-10 bg-gray-200 rounded flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-bold text-sm">{w.title}</p>
                    <p className="text-xs text-gray-500">{w.author}</p>
                  </div>
                </div>
                <button onClick={() => addWebtoon(w.id)}
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600">
                  추가
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {items.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
            아직 웹툰이 없어요! 위에서 추가해보세요.
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
            {item.thumbnail_url ? (
              <img src={item.thumbnail_url} alt={item.title} className="w-16 h-20 object-cover rounded-lg flex-shrink-0" />
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