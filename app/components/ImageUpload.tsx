'use client';
import { useState, useRef, useCallback } from 'react';
import CropModal from './CropModal';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  aspect?: number;      // 기본값 3/4 (썸네일), 프로필은 1 전달
  circular?: boolean;
}

export default function ImageUpload({ onUpload, aspect = 3 / 4, circular = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(file: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert('5MB 이하 파일만 업로드할 수 있어요');
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  const handleCropComplete = useCallback(async (blob: Blob) => {
    setCropSrc(null);
    setUploading(true);
    const formData = new FormData();
    formData.append('file', new File([blob], 'cropped.jpg', { type: 'image/jpeg' }));
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) return alert(data.error);
    onUpload(data.url);
  }, [onUpload]);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition"
      >
        {uploading ? '업로드 중...' : '이미지 업로드'}
      </button>

      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          aspect={aspect}
          circular={circular}
          onComplete={handleCropComplete}
          onClose={() => {
            setCropSrc(null);
            if (inputRef.current) inputRef.current.value = '';
          }}
        />
      )}
    </>
  );
}