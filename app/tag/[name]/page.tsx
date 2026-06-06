'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TagPage() {
  const params = useParams();
  const router = useRouter();
  const name = params.name as string;
  const tag = decodeURIComponent(name);
  const [webtoons, setWebtoons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tag?name=${encodeURIComponent(tag)}`)
      .then(r => r.json())
      .then(data => { setWebtoons(data); setLoading(false); });
  }, [tag]);

  if (loading) return <div className="p-8 text-center">로딩중...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">←</button>
          <h1 className="text-2xl font-bold text-gray-900">#{tag}</h1>
          <span className="text-gray-400 text-sm">{webtoons.length}개</span>
        </div>
        <div className="flex flex-col gap-3 md:hidden">
          {webtoons.map((webtoon: any) => (
            <Link href={`/webtoon/${webtoon.id}`} key={webtoon.id}>
              <div className="bg-white rounded-xl shadow p-3 flex items-center gap-3">
                {webtoon.thumbnail_url ? (
                  <img src={webtoon.thumbnail_url} alt={webtoon.title} className="w-14 h-20 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="bg-gray-200 rounded-lg w-14 h-20 flex-shrink-0" />
                )}
                <div>
                  <h2 className="font-bold text-sm text-gray-900">{webtoon.title}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{webtoon.author}</p>
                  <p className="text-xs text-blue-500 mt-0.5">{Array.isArray(webtoon.platform) ? webtoon.platform.join(', ') : webtoon.platform}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="hidden md:grid md:grid-cols-4 gap-4">
          {webtoons.map((webtoon: any) => (
            <Link href={`/webtoon/${webtoon.id}`} key={webtoon.id} className="flex">
              <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition flex flex-col w-full">
                {webtoon.thumbnail_url ? (
                  <img src={webtoon.thumbnail_url} alt={webtoon.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                ) : (
                  <div className="bg-gray-200 rounded-lg h-40 mb-3" />
                )}
                <div className="flex flex-col flex-1">
                  <h2 className="font-bold text-sm text-gray-900">{webtoon.title}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{webtoon.author}</p>
                  <p className="text-xs text-blue-500 mt-0.5">{Array.isArray(webtoon.platform) ? webtoon.platform.join(', ') : webtoon.platform}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {webtoons.length === 0 && <p className="text-center text-gray-400 mt-8">해당 태그 작품이 없어요!</p>}
      </div>
    </main>
  );
}