'use client';
import { useState, useRef, KeyboardEvent } from 'react';

export default function TagInput({ value, onChange, placeholder = '태그 (쉼표로 구분 - 예. 순애, 계략남주, 조폭)' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag || tags.includes(tag)) { setInput(''); return; }
    onChange([...tags, tag].join(','));
    setInput('');
  }

  function removeTag(idx: number) {
    onChange(tags.filter((_, i) => i !== idx).join(','));
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }

  return (
    <div
     style={{ background: '#F9F9F9', border: '0.5px solid #EBEBEB', borderRadius: 7 }}
      className="flex flex-wrap gap-1 px-2 py-1.5 cursor-text min-h-[38px]"
      onClick={() => inputRef.current?.focus()}>
      {tags.map((tag, i) => (
        <span key={i} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
          style={{ background: '#EEEDFE', color: '#534AB7' }}>
          #{tag}
          <button type="button" onClick={e => { e.stopPropagation(); removeTag(i); }}
            style={{ color: '#534AB7', opacity: 0.6 }}>×</button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder={tags.length === 0 && input === '' ? placeholder : ''}
      className="outline-none bg-transparent flex-1 min-w-[80px] py-0.5"
        style={{ fontSize: 12, color: '#1a1a1a' }}
      />
    </div>
  );
}