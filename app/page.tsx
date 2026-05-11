'use client';

import { useState, useEffect } from "react";
import { Todo, FilterType } from "./types/todo";
import { todoService } from "./lib/todoService";
import Modal from "./components/Modal";
import TodoForm from "./components/TodoForm";
import TodoFilter from "./components/TodoFilter";
import TodoItem from "./components/TodoItem";
import TodoDetail from "./components/TodoDetail";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [preReqSearch, setPreReqSearch] = useState("");

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
    const todoToToggle = todos.find((t) => t.id === id);
    if (!todoToToggle) return;

    let newTodos = [...todos];

    if (!todoToToggle.completed) {
      // 완료 처리 시: 선행 작업이 모두 완료되었는지 확인
      if (todoToToggle.prerequisites?.length) {
        const incompletePrereqs = todos.filter(
          (t) => todoToToggle.prerequisites?.includes(t.id) && !t.completed
        );

        if (incompletePrereqs.length > 0) {
          alert(`먼저 완료해야 할 선행 작업이 있습니다:\n${incompletePrereqs.map((t) => `- ${t.text}`).join("\n")}`);
          return;
        }
      }
      newTodos = newTodos.map((t) => (t.id === id ? { ...t, completed: true } : t));
    } else {
      // 완료 취소 시: 해당 작업을 선행 작업으로 가지는 후행 작업들도 연쇄적으로 완료 취소
      const idsToUncheck = new Set<string>([id]);
      let expanded = true;
      while (expanded) {
        expanded = false;
        for (const t of newTodos) {
          if (t.completed && !idsToUncheck.has(t.id) && t.prerequisites?.some((pId) => idsToUncheck.has(pId))) {
            idsToUncheck.add(t.id);
            expanded = true;
          }
        }
      }
      newTodos = newTodos.map((t) => (idsToUncheck.has(t.id) ? { ...t, completed: false } : t));
    }

    await todoService.saveAll(newTodos);
    setTodos(newTodos);
  };

  const handleDelete = async (id: string) => {
    const todoToDelete = todos.find(t => t.id === id);
    const dependentTodos = todos.filter(t => t.prerequisites?.includes(id));

    if (dependentTodos.length > 0) {
      const isConfirmed = window.confirm(
        `'${todoToDelete?.text}' 항목은 다음 할 일들의 선행 작업으로 등록되어 있습니다:\n${dependentTodos.map(t => `- ${t.text}`).join('\n')}\n\n삭제하시겠습니까? (삭제 시 선행 작업 목록에서도 자동으로 제거됩니다.)`
      );
      if (!isConfirmed) return;
    }

    const updated = await todoService.deleteTodo(id);
    setTodos(updated);
  };

  const handleUpdateDetail = async (id: string, updates: Partial<Todo>) => {
    if (!selectedTodo) return;

    // 선행 작업 업데이트 시 순환 참조 방지 체크 (안전 장치)
    if (updates.prerequisites && updates.prerequisites.length > (selectedTodo.prerequisites?.length || 0)) {
      const addedId = updates.prerequisites.find(pId => !selectedTodo.prerequisites?.includes(pId));
      if (addedId) {
        const queue = [addedId];
        const visited = new Set();
        while (queue.length > 0) {
          const curr = queue.shift()!;
          if (curr === id) {
            alert("순환 참조가 발생하여 선행 작업을 추가할 수 없습니다.");
            return;
          }
          if (visited.has(curr)) continue;
          visited.add(curr);
          const currTodo = todos.find(t => t.id === curr);
          if (currTodo?.prerequisites) queue.push(...currTodo.prerequisites);
        }
      }
    }

    const updated = await todoService.updateTodo(id, updates);
    setTodos(updated);
    if (selectedTodo?.id === id) {
      setSelectedTodo({ ...selectedTodo, ...updates });
    }
  };
  const handleSaveDetail = () => setSelectedTodo(null);

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });
  
  if (!isLoaded) return <div className="min-h-screen bg-slate-50" />;
  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 font-sans p-8 sm:p-20">

      <main className="flex w-full max-w-xl flex-col gap-8 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-zinc-200">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-black">Todo List</h1>
        </div>
        
        <TodoForm value={inputValue} onChange={setInputValue} onSubmit={handleAddTodo} />

        <TodoFilter currentFilter={filter} onFilterChange={setFilter} />

        <div className="flex flex-col gap-3 min-h-[300px]">
          {filteredTodos.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-20">할 일이 없습니다.</p>
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                allTodos={todos} 
                onToggle={handleToggle} 
                onDelete={handleDelete} 
                onClick={setSelectedTodo} 
              />
            ))
          )}
        </div>
      </main>

      <Modal 
        isOpen={!!selectedTodo} 
        onClose={() => setSelectedTodo(null)} 
        title="할 일 상세보기"
      >
        {selectedTodo && (
          <TodoDetail 
            selectedTodo={selectedTodo} 
            todos={todos} 
            preReqSearch={preReqSearch} 
            onPreReqSearchChange={setPreReqSearch} 
            onUpdateDetail={handleUpdateDetail} 
            onDelete={(id) => { handleDelete(id); setSelectedTodo(null); }} 
            onSave={handleSaveDetail} 
          />
        )}
      </Modal>
    </div>
  );
}