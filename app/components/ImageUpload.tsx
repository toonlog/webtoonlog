'use client';
import { useState, useRef } from 'react';

export default function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert('5MB 이하 파일만 업로드할 수 있어요');
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) return alert(data.error);
    onUpload(data.url);
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <button type="button" onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition">
        {uploading ? '업로드 중...' : '이미지 업로드'}
      </button>
    </div>
  );
}