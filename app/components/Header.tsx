'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [nickname, setNickname] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    setNickname(localStorage.getItem('nickname'));
    if (uid) fetchProfileImage(uid);

    const onAuth = () => {
      const newNick = localStorage.getItem('nickname');
      const newUid = localStorage.getItem('userId');
      setNickname(newNick);
      if (newUid) fetchProfileImage(newUid);
      else setProfileImage(null);
    };
    window.addEventListener('authChange', onAuth);
    return () => window.removeEventListener('authChange', onAuth);
  }, []);

  useEffect(() => {
    if (showSearch) inputRef.current?.focus();
  }, [showSearch]);

  function fetchProfileImage(uid: string) {
    fetch(`/api/users/${uid}`).then(r => r.json()).then(data => {
      setProfileImage(data.user?.profile_image || null);
    });
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    localStorage.removeItem('userId');
    setNickname(null);
    setProfileImage(null);
    window.dispatchEvent(new Event('authChange'));
    router.push('/');
  }

  function handleSearch(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
    if (e.key === 'Escape') {
      setShowSearch(false);
      setSearchQuery('');
    }
  }

  return (
    <header className="bg-white border-b px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* 로고 - 파란 정사각형 */}
      <Link href="/" className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg hover:bg-blue-600 transition" />

      <div className="flex items-center gap-3">
        {/* 검색 */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center overflow-hidden transition-all duration-300 border rounded-full ${showSearch ? 'w-32 md:w-40 px-3 border-gray-300' : 'w-0 border-transparent'}`}>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="검색..."
              className="w-full text-sm outline-none bg-transparent py-1 text-gray-700"
            />
          </div>
          <button
            onClick={() => {
              if (showSearch && searchQuery.trim()) {
                router.push(`/?q=${encodeURIComponent(searchQuery)}`);
                setShowSearch(false);
                setSearchQuery('');
              } else {
                setShowSearch(!showSearch);
              }
            }}
            className={`transition-transform duration-300 text-gray-500 hover:text-gray-700 ${showSearch ? 'scale-75' : 'scale-100'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        {nickname ? (
          <>
            <Link href="/mypage">
              {profileImage ? (
                <img src={profileImage} alt="프로필" className="w-8 h-8 rounded-full object-cover hover:opacity-80 transition" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm text-blue-500 font-bold hover:opacity-80 transition">
                  {nickname.charAt(0)}
                </div>
              )}
            </Link>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500 transition hidden md:block">로그아웃</button>
          </>
        ) : (
          <Link href="/login" className="text-sm bg-blue-500 text-white px-3 md:px-4 py-1.5 rounded-lg hover:bg-blue-600 transition">
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}