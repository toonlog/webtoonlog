export const revalidate = 60; // 60초 캐시

import Link from 'next/link';
import base from './lib/airtable';
import FeedbackButton from './components/FeedbackButton';
import Carousel from './components/Carousel';
import ScrollToTop from './components/ScrollToTop';
import FilterBar from './components/FilterBar';
import WebtoonList from './components/WebtoonList';

async function getWebtoons(search?: string, genre?: string, platform?: string) {
  const records = await base('WEBTOON').select({
    maxRecords: 100,
    view: 'Grid view',
    sort: [{ field: 'title', direction: 'asc' }],
  }).all();
  let all = records.map(record => ({ id: record.id, ...record.fields })) as any[];

  if (search) {
    const q = search.replace(/^#/, '');
    all = all.filter(w => {
      const genres = typeof w.genre === 'string' ? w.genre.split(',').map((g: string) => g.trim()) : [];
      const platforms = Array.isArray(w.platform) ? w.platform : [];
      return (
        w.title?.includes(q) ||
        w.author?.includes(q) ||
        genres.some((g: string) => g.includes(q)) ||
        platforms.some((p: string) => p.includes(q))
      );
    });
  }

  if (genre) all = all.filter(w => {
    const genres = typeof w.genre === 'string' ? w.genre.split(',').map((g: string) => g.trim()) : (Array.isArray(w.genre) ? w.genre : []);
    return genres.includes(genre);
  });

  if (platform) all = all.filter(w => Array.isArray(w.platform) ? w.platform.includes(platform) : w.platform === platform);
  return all;
}

async function getBoomWebtoons() {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const dateStr = oneWeekAgo.toISOString().split('T')[0];
    const recentReviews = await base('REVIEW').select({
      filterByFormula: `{created_at} >= "${dateStr}"`,
    }).all();
    const countMap: Record<string, number> = {};
    recentReviews.forEach((r: any) => {
      const wId = r.fields.webtoon_id as string;
      if (wId) countMap[wId] = (countMap[wId] || 0) + 1;
    });
    if (Object.keys(countMap).length === 0) return [];
    const webtoonIds = Object.entries(countMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);
    const webtoons = await Promise.all(webtoonIds.map(async (id) => {
      try {
        const r = await base('WEBTOON').find(id);
        return { id: r.id, ...r.fields, weeklyCount: countMap[id] };
      } catch { return null; }
    }));
    return webtoons.filter(Boolean);
  } catch { return []; }
}


export default async function Home({ searchParams }: any) {
  const params = await searchParams;
  const search = params?.q || '';
  const genre = params?.genre || '';
  const platform = params?.platform || '';
const webtoons = await getWebtoons(search, genre, platform);
  const boomWebtoons = await getBoomWebtoons();

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="flex justify-between items-center max-w-4xl mx-auto mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">웹툰로그</h1>
        <Link href="/add" className="bg-blue-500 text-white px-3 md:px-4 py-2 rounded-xl text-sm hover:bg-blue-600">
          + 웹툰 등록
        </Link>
      </div>

      <div className="max-w-4xl mx-auto mb-6">
        <Carousel />
      </div>

      <form method="GET" className="max-w-4xl mx-auto mb-4">
        <input name="q" defaultValue={search} placeholder="제목 또는 작가 검색..."
          className="w-full border rounded-xl px-4 py-2 shadow-sm text-gray-900" />
        <input type="hidden" name="genre" value={genre} />
        <input type="hidden" name="platform" value={platform} />
      </form>

    <FilterBar initialGenre={genre} initialPlatform={platform} search={search} />

      {/* 이번 주 인기작 */}
      {boomWebtoons.length > 0 && !search && !genre && !platform && (
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">🔥 이번 주 인기작</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {boomWebtoons.map((w: any) => (
              <Link key={w.id} href={`/webtoon/${w.id}`} className="flex-shrink-0">
                <div className="bg-white rounded-xl shadow p-3 w-32 md:w-36 hover:shadow-md transition">
                  {w.thumbnail_url ? (
                    <img src={w.thumbnail_url} alt={w.title} className="w-full h-36 md:h-44 object-cover rounded-lg mb-2" />
                  ) : (
                    <div className="w-full h-36 md:h-44 bg-gray-200 rounded-lg mb-2" />
                  )}
                  <p className="font-bold text-xs text-gray-900 truncate">{w.title}</p>
                  <p className="text-xs text-gray-500 truncate">{w.author}</p>
                  <p className="text-xs text-orange-500 mt-1">리뷰 {w.weeklyCount}개</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

<div className="max-w-4xl mx-auto">
        <WebtoonList webtoons={webtoons} />
      </div>

      {webtoons.length === 0 && <p className="text-center text-gray-400 mt-8">검색 결과가 없어요!</p>}

      <div className="max-w-4xl mx-auto mt-12 text-center">
        <FeedbackButton />
      </div>
      <ScrollToTop />
    </main>
  );
}