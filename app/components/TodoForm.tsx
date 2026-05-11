'use client';

interface TodoFormProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function TodoForm({ value, onChange, onSubmit }: TodoFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="할 일을 입력하세요..."
        className="flex-1 rounded-lg border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />
      <button
        type="submit"
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-80 transition-opacity"
      >
        추가
      </button>
    </form>
  );
}