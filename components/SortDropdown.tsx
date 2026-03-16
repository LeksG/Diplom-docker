'use client';

import { useState, useRef, useEffect } from 'react';

// Варіанти сортування
const sortOptions = [
  { value: 'newest', label: 'Новинки' },
  { value: 'price_asc', label: 'Від дешевих до дорогих' },
  { value: 'price_desc', label: 'Від дорогих до дешевих' },
];

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Знаходимо поточний вибраний текст
  const selectedLabel = sortOptions.find(opt => opt.value === value)?.label || 'Сортувати';

  // Закриваємо при кліку поза меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Кнопка, яку видно завжди */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 bg-white border border-gray-200 text-slate-900 font-bold py-2.5 px-4 rounded-xl shadow-sm hover:border-slate-400 transition-all outline-none min-w-[180px]"
      >
        <span>{selectedLabel}</span>
        <svg 
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {/* випадаюче меню */}
      {isOpen && (
        <ul className="absolute z-50 top-full right-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {sortOptions.map((option) => (
            <li
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors ${
                value === option.value 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-700 hover:bg-gray-50' 
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}