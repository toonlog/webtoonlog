'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error);

    localStorage.setItem('token', data.token);
    localStorage.setItem('nickname', data.nickname);
    localStorage.setItem('userId', data.userId);
    window.dispatchEvent(new Event('authChange'));
    router.push('/');
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">웹툰로그</h1>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'login' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
            로그인
          </button>
          <button onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'register' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
            회원가입
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <input
            className="border rounded-lg p-3 text-sm"
            placeholder="닉네임"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <input
            className="border rounded-lg p-3 text-sm"
            type="password"
            placeholder="비밀번호 (4자 이상)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition">
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </div>
      </div>
    </main>
  );
}