'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FeedbackButton() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  function handleClick() {
    const token = localStorage.getItem('token');
    if (!token) {
      if (confirm('의견 보내기는 로그인이 필요해요. 로그인 페이지로 이동할까요?')) {
        router.push('/login');
      }
      return;
    }
    setShowModal(true);
  }

  async function send() {
    if (!content.trim()) return alert('내용을 입력해주세요!');
    setSending(true);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content }),
    });
    setSending(false);
    if (res.ok) {
      setContent('');
      setShowModal(false);
      alert('의견이 전달됐어요! 감사합니다 🙏');
    }
  }

  return (
    <>
      <button onClick={handleClick}
        className="text-sm text-gray-400 hover:text-blue-500 transition border border-gray-200 px-4 py-2 rounded-full hover:border-blue-300">
        💬 관리자에게 의견 보내기
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">관리자에게 의견 보내기</h2>
            <textarea
              className="w-full border rounded-lg p-3 text-sm mb-4"
              rows={5}
              placeholder="불편한 점, 개선 제안, 칭찬 등 자유롭게 작성해주세요!"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                취소
              </button>
              <button onClick={send} disabled={sending}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                {sending ? '전송 중...' : '보내기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}