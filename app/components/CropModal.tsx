'use client';

import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CropModalProps {
  imageSrc: string;
  aspect: number; // 썸네일: 3/4, 프로필: 1
  circular?: boolean;
  onComplete: (blob: Blob) => void;
  onClose: () => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function CropModal({ imageSrc, aspect, circular = false, onComplete, onClose }: CropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  }, [aspect]);

  const handleConfirm = useCallback(async () => {
    const image = imgRef.current;
    if (!image || !completedCrop) return;

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (circular) {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (blob) onComplete(blob);
    }, 'image/jpeg', 0.92);
  }, [completedCrop, circular, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-white rounded-xl p-5 max-w-lg w-full mx-4 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">이미지 크롭</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="flex justify-center max-h-[60vh] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            circularCrop={circular}
            minWidth={50}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="크롭 대상"
              onLoad={onImageLoad}
              style={{ maxHeight: '55vh', maxWidth: '100%', objectFit: 'contain' }}
            />
          </ReactCrop>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!completedCrop}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 disabled:opacity-40"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}