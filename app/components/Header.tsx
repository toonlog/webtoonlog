'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [nickname, setNickname] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

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

  return (
    <header className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="font-bold text-lg text-blue-600">웹툰로그</Link>
      <div className="flex items-center gap-4">
        {nickname ? (
          <>
            <Link href="/collections" className="text-sm text-gray-500 hover:text-blue-500 transition">컬렉션</Link>
            <Link href="/mypage">
              {profileImage ? (
                <img src={profileImage} alt="프로필" className="w-8 h-8 rounded-full object-cover hover:opacity-80 transition" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm text-blue-500 font-bold hover:opacity-80 transition">
                  {nickname.charAt(0)}
                </div>
              )}
            </Link>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500 transition">로그아웃</button>
          </>
        ) : (
          <Link href="/login" className="text-sm bg-blue-500 text-white px-4 py-1.5 rounded-lg hover:bg-blue-600 transition">
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}