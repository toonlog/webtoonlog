import Link from 'next/link';
import base from '../../lib/airtable';

async function getWebtoonsByGenre(genre: string) {
  const decoded = decodeURIComponent(genre);
  const records = await base('WEBTOON').select({
    maxRecords: 100,
    sort: [{ field: 'title', direction: 'asc' }],
  }).all();

  return records
    .map(r => ({ id: r.id, ...r.fields }))
    .filter((w: any) => {
      if (!w.genre) return false;
      const genres = w.genre.split(',').map((g: string) => g.trim());
      return genres.includes(decoded);
    }) as any[];
}

export default async function GenrePage({ params }: any) {
  const genre = decodeURIComponent(params.name);
  const webtoons = await getWebtoonsByGenre(params.name);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← 홈</Link>
          <h1 className="text-2xl font-bold text-gray-900">#{genre}</h1>
          <span className="text-gray-400 text-sm">{webtoons.length}개</span>
        </div>

        {/* 모바일 */}
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
                  <p className="text-xs text-blue-500 mt-0.5">{webtoon.platform}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* PC */}
        <div className="hidden md:grid md:grid-cols-4 gap-4">
          {webtoons.map((webtoon: any) => (
            <Link href={`/webtoon/${webtoon.id}`} key={webtoon.id} className="flex">
              <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition flex flex-col w-full">
                {webtoon.thumbnail_url ? (
                  <img src={webtoon.thumbnail_url} alt={webtoon.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                ) : (
                  <div className="bg-gray-200 rounded-lg h-40 mb-3" />
                )}
                <h2 className="font-bold text-sm text-gray-900">{webtoon.title}</h2>
                <p className="text-xs text-gray-500 mt-1">{webtoon.author}</p>
                <p className="text-xs text-blue-500 mt-0.5">{webtoon.platform}</p>
              </div>
            </Link>
          ))}
        </div>

        {webtoons.length === 0 && (
          <p className="text-center text-gray-400 mt-8">해당 장르 작품이 없어요!</p>
        )}
      </div>
    </main>
  );
}