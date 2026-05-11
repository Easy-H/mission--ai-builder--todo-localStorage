'use client';

import { useState, useEffect } from "react";
import { Todo, FilterType } from "./types/todo";
import { todoService } from "./lib/todoService";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoaded, setIsLoaded] = useState(false);

  // 초기 데이터 로드 (클라이언트 사이드 전용)
  useEffect(() => {
    todoService.getTodos().then((data) => {
      setTodos(data);
      setIsLoaded(true);
    });
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo = await todoService.addTodo(inputValue);
    setTodos([newTodo, ...todos]);
    setInputValue("");
  };

  const handleToggle = async (id: string) => {
    const updated = await todoService.toggleTodo(id);
    setTodos(updated);
  };

  const handleDelete = async (id: string) => {
    const updated = await todoService.deleteTodo(id);
    setTodos(updated);
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  if (!isLoaded) return <div className="min-h-screen bg-zinc-50 dark:bg-black" />;

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans dark:bg-black p-8 sm:p-20">
      <main className="flex w-full max-w-xl flex-col gap-8 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">Todo List</h1>
        
        {/* 입력 섹션 */}
        <form onSubmit={handleAddTodo} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="할 일을 입력하세요..."
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
          <button
            type="submit"
            className="rounded-lg bg-black dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-black hover:opacity-80 transition-opacity"
          >
            추가
          </button>
        </form>

        {/* 필터 탭 */}
        <div className="flex gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition-colors ${
                filter === f 
                  ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white" 
                  : "text-zinc-500 hover:text-black dark:hover:text-white"
              }`}
            >
              {f === 'all' ? '전체' : f === 'active' ? '진행 중' : '완료'}
            </button>
          ))}
        </div>

        {/* 리스트 섹션 */}
        <div className="flex flex-col gap-3 min-h-[300px]">
          {filteredTodos.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-20">할 일이 없습니다.</p>
          ) : (
            filteredTodos.map((todo) => (
              <div key={todo.id} className="flex items-center gap-3 group">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo.id)}
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 accent-black dark:accent-white"
                />
                <span className={`flex-1 text-sm ${todo.completed ? "text-zinc-400 line-through" : "text-black dark:text-zinc-200"}`}>
                  {todo.text}
                </span>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-600 transition-opacity"
                >
                  삭제
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}