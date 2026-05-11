'use client';

import { Todo } from "../types/todo";

interface TodoItemProps {
  todo: Todo;
  allTodos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (todo: Todo) => void;
}

export default function TodoItem({ todo, allTodos, onToggle, onDelete, onClick }: TodoItemProps) {
  const blockedTodos = allTodos.filter(t => t.prerequisites?.includes(todo.id));
  const prereqTodos = (todo.prerequisites || [])
    .map(pId => allTodos.find(t => t.id === pId))
    .filter((p): p is Todo => !!p);

  const isBlockedByOthers = !todo.completed && prereqTodos.some(p => !p.completed);

  return (
    <div className="flex items-center gap-3 group py-1">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="h-4 w-4 rounded border-zinc-300 accent-black cursor-pointer"
      />
      <div
        onClick={() => onClick(todo)}
        className={`flex-1 flex flex-col items-start gap-1 text-left text-sm cursor-pointer hover:bg-zinc-50 p-1 rounded transition-colors ${todo.completed ? "text-zinc-400 line-through" : "text-black"}`}
      >
        <span>{todo.text}</span>
        <div className="flex gap-2">
          {prereqTodos.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prereqTodos.map(p => (
                <span key={p.id} className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${p.completed ? 'bg-green-50 border-green-100 text-green-700' : 'bg-zinc-200 border-zinc-300 text-zinc-800'}`}>
                  {isBlockedByOthers && !p.completed && "🔒 "}{p.text}
                </span>
              ))}
            </div>
          )}
          {blockedTodos.length > 0 && !todo.completed && (
            <div className="flex flex-wrap gap-1">
              {blockedTodos.map(t => (
                <span key={t.id} className="text-[9px] px-1.5 py-0.5 bg-amber-50 border border-amber-100 text-amber-600 rounded">
                  대기 중: {t.text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-600 transition-opacity"
      >
        삭제
      </button>
    </div>
  );
}