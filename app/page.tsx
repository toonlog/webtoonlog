import Link from 'next/link';
import base from './lib/airtable';
import FeedbackButton from './components/FeedbackButton';

async function getWebtoons(search?: string, genre?: string, platform?: string) {
  const records = await base('WEBTOON').select({
    maxRecords: 100,
    view: 'Grid view',
    sort: [{ field: 'title', direction: 'asc' }],
  }).all();
  let all = records.map(record => ({ id: record.id, ...record.fields })) as any[];
  if (search) all = all.filter(w => w.title?.includes(search) || w.author?.includes(search));
  if (genre) all = all.filter(w => Array.isArray(w.genre) ? w.genre.includes(genre) : w.genre === genre);
  if (platform) all = all.filter(w => Array.isArray(w.platform) ? w.platform.includes(platform) : w.platform === platform);
  return all;
}

const GENRES = ['BL', 'GL', '로맨스', '판타지', '현대', '드라마', '액션', '무협', '스릴러', '공포', '개그', 'SF', '스포츠', '일상'];
const PLATFORMS = ['네이버웹툰', '카카오페이지', '레진코믹스', '봄툰', '리디', '피너툰', '탑툰', '코미코', '기타'];

export default async function Home({ searchParams }: any) {
  const params = await searchParams;
  const search = params?.q || '';
  const genre = params?.genre || '';
  const platform = params?.platform || '';
  const webtoons = await getWebtoons(search, genre, platform);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="flex justify-between items-center max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900">웹툰로그</h1>
        <Link href="/add" className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-600">
          + 웹툰 등록
        </Link>
      </div>

      <form method="GET" className="max-w-4xl mx-auto mb-4">
        <input name="q" defaultValue={search} placeholder="제목 또는 작가 검색..."
          className="w-full border rounded-xl px-4 py-2 shadow-sm text-gray-900" />
        <input type="hidden" name="genre" value={genre} />
        <input type="hidden" name="platform" value={platform} />
      </form>

      {/* 장르 필터 */}
      <div className="max-w-4xl mx-auto mb-3">
        <div className="flex flex-wrap gap-2">
          <Link href={`/?q=${search}&platform=${platform}`}
            className={`px-3 py-1 rounded-full text-sm border transition ${!genre ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
            전체
          </Link>
          {GENRES.map(g => (
            <Link key={g} href={`/?q=${search}&genre=${g}&platform=${platform}`}
              className={`px-3 py-1 rounded-full text-sm border transition ${genre === g ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              {g}
            </Link>
          ))}
        </div>
      </div>

      {/* 플랫폼 필터 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex flex-wrap gap-2">
          <Link href={`/?q=${search}&genre=${genre}`}
            className={`px-3 py-1 rounded-full text-sm border transition ${!platform ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
            전체
          </Link>
          {PLATFORMS.map(p => (
            <Link key={p} href={`/?q=${search}&genre=${genre}&platform=${p}`}
              className={`px-3 py-1 rounded-full text-sm border transition ${platform === p ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              {p}
            </Link>
          ))}
        </div>
      </div>

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
                  <p className="text-xs text-blue-500 mt-0.5">{Array.isArray(webtoon.platform) ? webtoon.platform.join(', ') : webtoon.platform}</p>
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
                <p className="text-xs text-blue-500">{Array.isArray(webtoon.platform) ? webtoon.platform.join(', ') : webtoon.platform}</p>
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

      {/* 의견 보내기 */}
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <FeedbackButton />
      </div>
    </main>
  );
}