'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) { router.push('/login'); return; }
    fetchCollections(userId);
  }, []);

  function fetchCollections(userId: string) {
    fetch(`/api/collections?userId=${userId}`)
      .then(r => r.json())
      .then(data => { setCollections(Array.isArray(data) ? data : []); setLoading(false); });
  }

  async function createCollection() {
    if (!name.trim()) return alert('이름을 입력해주세요!');
    setSubmitting(true);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, description, is_public: isPublic }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return alert(data.error);
    setCollections(prev => [data, ...prev]);
    setName('');
    setDescription('');
    setShowForm(false);
  }

  async function updateCollection(collectionId: string) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/collections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ collectionId, name: editName, description: editDescription, is_public: editIsPublic }),
    });
    if (!res.ok) return alert('수정 실패했어요');
    setCollections(prev => prev.map(c => c.id === collectionId
      ? { ...c, name: editName, description: editDescription, is_public: editIsPublic }
      : c
    ));
    setEditingId(null);
  }

  async function deleteCollection(collectionId: string) {
    if (!confirm('컬렉션을 삭제할까요?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/collections?collectionId=${collectionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setCollections(prev => prev.filter(c => c.id !== collectionId));
  }

  if (loading) return <div className="p-8 text-center">로딩중...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">내 컬렉션</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition">
          + 새 컬렉션
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-bold mb-4 text-gray-900">새 컬렉션 만들기</h2>
          <div className="flex flex-col gap-3">
            <input className="border rounded-lg p-3 text-sm text-gray-900" placeholder="컬렉션 이름 *"
              value={name} onChange={e => setName(e.target.value)} />
            <textarea className="border rounded-lg p-3 text-sm text-gray-900" rows={2} placeholder="설명 (선택)"
              value={description} onChange={e => setDescription(e.target.value)} />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
              공개 컬렉션
            </label>
            <div className="flex gap-2">
              <button onClick={createCollection} disabled={submitting}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50">
                {submitting ? '만드는 중...' : '만들기'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="bg-gray-100 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {collections.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
            아직 컬렉션이 없어요! 만들어보세요 🎉
          </div>
        )}
        {collections.map(c => (
          <div key={c.id} className="bg-white rounded-xl shadow p-6">
            {editingId === c.id ? (
              <div className="flex flex-col gap-3">
                <input className="border rounded-lg p-2 text-sm text-gray-900"
                  value={editName} onChange={e => setEditName(e.target.value)} />
                <textarea className="border rounded-lg p-2 text-sm text-gray-900" rows={2}
                  value={editDescription} onChange={e => setEditDescription(e.target.value)} />
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={editIsPublic} onChange={e => setEditIsPublic(e.target.checked)} />
                  공개 컬렉션
                </label>
                <div className="flex gap-2">
                  <button onClick={() => updateCollection(c.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm">저장</button>
                  <button onClick={() => setEditingId(null)}
                    className="bg-gray-100 px-3 py-1 rounded-lg text-sm">취소</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <Link href={`/collections/${c.id}`} className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-bold text-lg text-gray-900 hover:text-blue-500 transition">{c.name}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_public ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {c.is_public ? '공개' : '비공개'}
                    </span>
                  </div>
                  {c.description && <p className="text-gray-500 text-sm">{c.description}</p>}
                  <p className="text-gray-400 text-xs mt-2">{c.created_at}</p>
                </Link>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => { setEditingId(c.id); setEditName(c.name); setEditDescription(c.description); setEditIsPublic(c.is_public); }}
                    className="text-xs text-gray-400 hover:text-blue-500">수정</button>
                  <button onClick={() => deleteCollection(c.id)}
                    className="text-xs text-gray-400 hover:text-red-500">삭제</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}