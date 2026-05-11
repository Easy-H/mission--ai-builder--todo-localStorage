'use client';

import { Todo } from "../types/todo";
import { todoService } from "../lib/todoService";

interface TodoDetailProps {
  selectedTodo: Todo;
  todos: Todo[];
  preReqSearch: string;
  onPreReqSearchChange: (val: string) => void;
  onUpdateDetail: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
}

export default function TodoDetail({
  selectedTodo,
  todos,
  preReqSearch,
  onPreReqSearchChange,
  onUpdateDetail,
  onDelete,
  onSave
}: TodoDetailProps) {
  // 순환 참조 여부 확인 (DFS/BFS)
  const isCircular = (targetId: string): boolean => {
    const queue = [targetId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (currentId === selectedTodo.id) return true;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const currentTodo = todos.find(t => t.id === currentId);
      if (currentTodo?.prerequisites) {
        queue.push(...currentTodo.prerequisites);
      }
    }
    return false;
  };

  const availablePrereqs = todos.filter(t => 
    t.id !== selectedTodo.id && 
    t.text.toLowerCase().includes(preReqSearch.toLowerCase()) &&
    !(selectedTodo.prerequisites || []).includes(t.id) &&
    !isCircular(t.id)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* 의존성 시각화 로드맵 */}
      {(selectedTodo.prerequisites?.length || 0) > 0 && (
        <div className="bg-slate-50 p-4 rounded-xl border border-zinc-100">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 block">의존성 로드맵</label>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-2">
              {(selectedTodo.prerequisites || [])
                .map(pId => todos.find(t => t.id === pId))
                .filter((p): p is Todo => !!p)
                .map((p) => (
                  <div key={p.id} className={`px-2 py-1 rounded text-xs border ${
                    p.completed 
                      ? "bg-green-50 border-green-200 text-green-700" 
                      : "bg-white border-zinc-200 text-zinc-600"
                  }`}>
                    {p.text}
                  </div>
                ))}
            </div>
            <span className="text-zinc-300">→</span>
            <div className="px-2 py-1 rounded text-xs bg-black text-white font-medium">
              {selectedTodo.text}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-zinc-500 uppercase">할 일</label>
        <input
          type="text"
          value={selectedTodo.text}
          onChange={(e) => onUpdateDetail(selectedTodo.id, { text: e.target.value })}
          className="w-full bg-transparent border-b border-zinc-200 py-1 text-black focus:outline-none focus:border-black"
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-zinc-500 uppercase">마감 날짜</label>
        <input
          type="date"
          value={selectedTodo.dueDate || ""}
          onChange={(e) => onUpdateDetail(selectedTodo.id, { dueDate: e.target.value })}
          className="w-full bg-transparent border-b border-zinc-200 py-1 text-black focus:outline-none focus:border-black"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-zinc-500 uppercase">선행 작업</label><div className="relative">
          <input
            type="text"
            placeholder="선행 작업 검색 또는 추가..."
            value={preReqSearch}
            onChange={(e) => onPreReqSearchChange(e.target.value)}
            className="w-full bg-transparent border-b border-zinc-200 py-1 text-black focus:outline-none focus:border-black text-sm"
          />
          {preReqSearch && (
            <div className="absolute left-0 right-0 mt-1 max-h-32 overflow-y-auto bg-white border border-zinc-200 rounded-md shadow-lg z-10">
              {availablePrereqs.map(todo => (
                <button
                  key={todo.id}
                  onClick={() => {
                    onUpdateDetail(selectedTodo.id, { prerequisites: [...(selectedTodo.prerequisites || []), todo.id] });
                    onPreReqSearchChange("");
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 text-black"
                >
                  {todo.text}
                </button>
              ))}
              <button
                onClick={async () => {
                  const newTodo = await todoService.addTodo(preReqSearch);
                  await onUpdateDetail(selectedTodo.id, { 
                    prerequisites: [...(selectedTodo.prerequisites || []), newTodo.id] 
                  });
                  onPreReqSearchChange("");
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-blue-500 hover:bg-blue-50"
              >
                + "{preReqSearch}" 새로 추가
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {(selectedTodo.prerequisites || []).map((pId) => {
            const prereqTodo = todos.find(t => t.id === pId);
            if (!prereqTodo) return null;
            return (
              <span key={pId} className="px-2 py-1 bg-zinc-100 text-xs rounded-md flex items-center gap-1">
                {prereqTodo.text}
                <button 
                  onClick={() => onUpdateDetail(selectedTodo.id, { 
                    prerequisites: selectedTodo.prerequisites?.filter(id => id !== pId) 
                  })}
                  className="text-zinc-400 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onDelete(selectedTodo.id)}
          className="flex-1 rounded-lg bg-red-50 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
        >
          삭제
        </button>
        <button
          onClick={onSave}
          className="flex-1 rounded-lg bg-black py-2.5 text-sm font-medium text-white hover:opacity-80 transition-opacity"
        >
          저장
        </button>
      </div>
    </div>
  );
}