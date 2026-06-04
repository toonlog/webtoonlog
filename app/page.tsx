import Link from 'next/link';
import base from './lib/airtable';

async function getWebtoons(search?: string) {
  const records = await base('WEBTOON').select({
    maxRecords: 100,
    view: 'Grid view',
  }).all();
  const all = records.map(record => ({ id: record.id, ...record.fields })) as any[];
  if (search) return all.filter(w => w.title?.includes(search) || w.author?.includes(search));
  return all;
}

export default async function Home({ searchParams }: any) {
  const search = (await searchParams)?.q || '';
  const webtoons = await getWebtoons(search);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-bold">웹툰로그</h1>
        <Link href="/add" className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-600">
          + 웹툰 등록
        </Link>
      </div>
      <form method="GET" className="max-w-4xl mx-auto mb-6">
        <input
          name="q"
          defaultValue={search}
          placeholder="제목 또는 작가 검색..."
          className="w-full border rounded-xl px-4 py-2 shadow-sm"
        />
      </form>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {webtoons.map((webtoon: any) => (
          <Link href={`/webtoon/${webtoon.id}`} key={webtoon.id}>
            <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition cursor-pointer">
              <div className="bg-gray-200 rounded-lg h-40 mb-3" />
              <h2 className="font-bold text-sm">{webtoon.title}</h2>
              <p className="text-xs text-gray-500">{webtoon.author}</p>
              <p className="text-xs text-blue-500">{webtoon.platform}</p>
            </div>
          </Link>
        ))}
      </div>
      {webtoons.length === 0 && <p className="text-center text-gray-400 mt-8">검색 결과가 없어요!</p>}
    </main>
  );
}