'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const INITIAL = 20;
const PAGE_SIZE = 10;

export default function WebtoonList({ webtoons }: { webtoons: any[] }) {
  const [visible, setVisible] = useState(INITIAL);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(INITIAL);
  }, [webtoons]);

  useEffect(() => {
    if (visible >= webtoons.length) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisible(prev => Math.min(prev + PAGE_SIZE, webtoons.length));
      }
}, { root: null, rootMargin: '400px', threshold: 0 });
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [visible, webtoons.length]);

  const displayed = webtoons.slice(0, visible);

  return (
    <div>
      {/* 모바일 */}
      <div className="flex flex-col gap-3 md:hidden">
        {displayed.map((webtoon: any) => (
          <Link href={`/webtoon/${webtoon.id}`} key={webtoon.id}>
            <div className="bg-white rounded-xl shadow p-3 hover:shadow-md transition flex items-center gap-3">
              <div className="w-14 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                {webtoon.thumbnail_url && (
                  <img src={webtoon.thumbnail_url} alt={webtoon.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <h2 className="font-bold text-sm text-gray-900 truncate leading-snug">{webtoon.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{webtoon.author}</p>
                <p className="text-xs text-blue-500 mt-0.5 truncate">{Array.isArray(webtoon.platform) ? webtoon.platform.join(', ') : webtoon.platform}</p>
                {webtoon.review_count > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-xs font-bold text-gray-700">{webtoon.avg_rating}</span>
                    <span className="text-xs text-gray-400">({webtoon.review_count})</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
        {visible < webtoons.length && <div ref={sentinelRef} className="h-12" />}
      </div>

      {/* PC */}
      <div className="hidden md:grid md:grid-cols-4 gap-4">
        {displayed.map((webtoon: any) => (
          <Link href={`/webtoon/${webtoon.id}`} key={webtoon.id} className="flex">
            <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition cursor-pointer flex flex-col w-full">
              {webtoon.thumbnail_url ? (
                <img src={webtoon.thumbnail_url} alt={webtoon.title} className="w-full h-40 object-cover rounded-lg mb-3" />
              ) : (
                <div className="bg-gray-200 rounded-lg h-40 mb-3" />
              )}
              <div className="flex flex-col flex-1">
                <h2 className="font-bold text-sm text-gray-900">{webtoon.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{webtoon.author}</p>
                <p className="text-xs text-blue-500 mt-0.5">{Array.isArray(webtoon.platform) ? webtoon.platform.join(', ') : webtoon.platform}</p>
                {webtoon.review_count > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-xs font-bold text-gray-700">{webtoon.avg_rating}</span>
                    <span className="text-xs text-gray-400">({webtoon.review_count})</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
        {visible < webtoons.length && <div ref={sentinelRef} className="h-12 col-span-4" />}
      </div>
    </div>
  );
}