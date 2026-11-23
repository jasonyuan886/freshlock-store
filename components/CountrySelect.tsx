'use client';

import { useEffect, useRef, useState } from 'react';

type Country = { code: string; name: string };

type Props = {
  countries: Country[];
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
};

export default function CountrySelect({ countries, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const boxRef = useRef<HTMLDivElement | null>(null);
  const selected = countries.find(c => c.code === value);
  const q = query.trim().toLowerCase();
  const filtered = q ? countries.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q) : countries;
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div className="relative" ref={boxRef}>
      <button type="button" onClick={() => { setOpen(o => !o); setQuery(''); }}
        className="w-full border rounded-lg px-4 py-2.5 text-left focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white flex items-center justify-between">
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>{selected ? selected.name : 'Select country'}</span>
        <span className="text-gray-400 text-xs">▼</span>
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border rounded-lg shadow-lg overflow-hidden">
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Type to search…"
            className="w-full px-3 py-2 border-b outline-none text-sm" />
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && <li className="px-3 py-2 text-sm text-gray-400">No match</li>}
            {filtered.map(c => (
              <li key={c.code}>
                <button type="button"
                  onClick={() => { onChange({ target: { name: 'country', value: c.code } }); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 ${c.code === value ? 'bg-green-50 font-semibold' : ''}`}>
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
