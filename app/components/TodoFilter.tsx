'use client';

import { FilterType } from "../types/todo";

interface TodoFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function TodoFilter({ currentFilter, onFilterChange }: TodoFilterProps) {
  return (
    <div className="flex gap-2 border-b border-zinc-100 pb-4">
      {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
        <button
          key={f}
          onClick={() => onFilterChange(f)}
          className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition-colors ${
            currentFilter === f 
              ? "bg-zinc-100 text-black" 
              : "text-zinc-500 hover:text-black"
          }`}
        >
          {f === 'all' ? '전체' : f === 'active' ? '진행 중' : '완료'}
        </button>
      ))}
    </div>
  );
}