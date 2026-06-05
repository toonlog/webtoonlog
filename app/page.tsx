import Link from 'next/link';
import base from './lib/airtable';

async function getWebtoons(search?: string) {
  const records = await base('WEBTOON').select({
    maxRecords: 100,
    view: 'Grid view',
    sort: [{ field: 'title', direction: 'asc' }],
  }).all();
  const all = records.map(record => ({ id: record.id, ...record.fields })) as any[];
  if (search) return all.filter(w => w.title?.includes(search) || w.author?.includes(search));
  return all;
}

export default async function Home({ searchParams }: any) {
  const search = (await searchParams)?.q || '';
  const webtoons = await getWebtoons(search);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="flex justify-between items-center max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900">웹툰로그</h1>
        <Link href="/add" className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-600">
          + 웹툰 등록
        </Link>
      </div>
      <form method="GET" className="max-w-4xl mx-auto mb-6">
        <input
          name="q"
          defaultValue={search}
          placeholder="제목 또는 작가 검색..."
          className="w-full border rounded-xl px-4 py-2 shadow-sm text-gray-900"
        />
      </form>

      <div className="max-w-4xl mx-auto">
        {/* 모바일 */}
        <div className="flex flex-col gap-3 md:hidden">
          {webtoons.map((webtoon: any) => (
            <Link href={`/webtoon/${webtoon.id}`} key={webtoon.id}>
              <div className="bg-white rounded-xl shadow p-3 hover:shadow-md transition flex items-center gap-3">
                {webtoon.thumbnail_url ? (
                  <img src={webtoon.thumbnail_url} alt={webtoon.title} className="w-14 h-20 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="bg-gray-200 rounded-lg w-14 h-20 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h2 className="font-bold text-sm text-gray-900">{webtoon.title}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{webtoon.author}</p>
                  <p className="text-xs text-blue-500 mt-0.5">{webtoon.platform}</p>
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
        </div>

        {/* PC */}
        <div className="hidden md:grid md:grid-cols-4 gap-4">
          {webtoons.map((webtoon: any) => (
            <Link href={`/webtoon/${webtoon.id}`} key={webtoon.id}>
              <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition cursor-pointer">
                {webtoon.thumbnail_url ? (
                  <img src={webtoon.thumbnail_url} alt={webtoon.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                ) : (
                  <div className="bg-gray-200 rounded-lg h-40 mb-3" />
                )}
                <h2 className="font-bold text-sm text-gray-900">{webtoon.title}</h2>
                <p className="text-xs text-gray-500">{webtoon.author}</p>
                <p className="text-xs text-blue-500">{webtoon.platform}</p>
                {webtoon.review_count > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-xs font-bold text-gray-700">{webtoon.avg_rating}</span>
                    <span className="text-xs text-gray-400">({webtoon.review_count})</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
      {webtoons.length === 0 && <p className="text-center text-gray-400 mt-8">검색 결과가 없어요!</p>}
    </main>
  );
}