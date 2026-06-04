import Link from 'next/link';

async function getWebtoons() {
  const res = await fetch('http://localhost:3000/api/webtoons', {
    cache: 'no-store',
  });
  return res.json();
}

export default async function Home() {
  const webtoons = await getWebtoons();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">웹툰로그</h1>
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
    </main>
  );
}