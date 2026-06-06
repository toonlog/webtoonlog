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
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [likeCount, setLikeCount] = useState(0);
const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setMyUserId(userId);
    fetchCollection();
    fetchItems();
    fetchLike();
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

  async function fetchLike() {
    const userId = localStorage.getItem('userId') || '';
    const res = await fetch(`/api/collections/like?collectionId=${collectionId}&userId=${userId}`);
    const data = await res.json();
    setLikeCount(data.count || 0);
    setLiked(data.liked || false);
  }

 async function toggleLike() {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');
    if (likeLoading) return;
    setLikeLoading(true);
    const res = await fetch('/api/collections/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ collectionId }),
    });
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount(prev => prev + (data.liked ? 1 : -1));
    setLikeLoading(false);
  }

  async function searchWebtoons(q: string) {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/webtoons/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!Array.isArray(data)) { setSearchResults([]); return; }
      const existingIds = new Set([...items.map(i => i.webtoon_id), ...pendingItems.map(i => i.id)]);
      setSearchResults(data.filter((w: any) => !existingIds.has(w.id)));
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  }

  function addToPending(webtoon: any) {
    setPendingItems(prev => [...prev, webtoon]);
    setSearchResults(prev => prev.filter(w => w.id !== webtoon.id));
  }

  function removeFromPending(webtoonId: string) {
    setPendingItems(prev => prev.filter(w => w.id !== webtoonId));
  }

  async function savePending() {
    const token = localStorage.getItem('token');
    for (const w of pendingItems) {
      await fetch('/api/collections/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ collectionId, webtoonId: w.id }),
      });
    }
    setPendingItems([]);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
    fetchItems();
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
        <div className="flex items-center gap-3 mt-2">
          <p className="text-gray-400 text-xs">웹툰 {items.length}개</p>
          {!isOwner && likeCount > 0 && (
            <p className="text-gray-400 text-xs">좋아요 {likeCount}</p>
          )}
        </div>
        <div className="flex items-center gap-3 mt-3">
          {isOwner && (
            <button onClick={() => setShowSearch(!showSearch)}
              className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
              + 웹툰 추가
            </button>
          )}
          {!isOwner && (
            <button onClick={toggleLike}
            style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 20,
                border: liked ? '1.5px solid #ec4899' : '1.5px solid #B4B2A9',
                background: 'transparent', cursor: likeLoading ? 'not-allowed' : 'pointer',
                fontSize: 13, color: liked ? '#444441' : '#888780',
                transition: 'all 0.2s', opacity: likeLoading ? 0.5 : 1,
                pointerEvents: likeLoading ? 'none' : 'auto',
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24"
                fill={liked ? '#ec4899' : 'none'}
                stroke={liked ? '#ec4899' : '#888780'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              컬렉션 좋아요 {likeCount > 0 ? likeCount : ''}
            </button>
          )}
        </div>
      </div>

      {/* 웹툰 추가 패널 */}
      {isOwner && showSearch && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm">웹툰 검색해서 추가</h2>
            <button onClick={savePending}
              disabled={pendingItems.length === 0}
              className="text-sm bg-blue-500 text-white px-4 py-1.5 rounded-lg hover:bg-blue-600 disabled:opacity-40 transition">
              저장 ({pendingItems.length})
            </button>
          </div>

          {pendingItems.length > 0 && (
            <div className="flex flex-col gap-2 mb-3">
              {pendingItems.map(w => (
                <div key={w.id} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    {w.thumbnail_url ? (
                      <img src={w.thumbnail_url} alt={w.title} className="w-8 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-8 h-10 bg-gray-200 rounded" />
                    )}
                    <p className="font-bold text-sm text-blue-800">{w.title}</p>
                  </div>
                  <button onClick={() => removeFromPending(w.id)}
                    className="text-xs text-gray-400 hover:text-red-500">✕</button>
                </div>
              ))}
            </div>
          )}

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
              <div key={w.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
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
                <button onClick={() => addToPending(w)}
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600">
                  추가
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 웹툰 목록 */}
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