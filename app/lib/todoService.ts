import { Todo } from '../types/todo';

const STORAGE_KEY = 'nextjs-todo-list';

// 로컬 스토리지를 API처럼 다루기 위한 추상화 객체
export const todoService = {
  // 전체 목록 가져오기
  getTodos: async (): Promise<Todo[]> => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // 할 일 추가
  addTodo: async (text: string): Promise<Todo> => {
    const todos = await todoService.getTodos();
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    const updated = [newTodo, ...todos];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newTodo;
  },

  // 상태 토글 (완료/미완료)
  toggleTodo: async (id: string): Promise<Todo[]> => {
    const todos = await todoService.getTodos();
    const updated = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // 할 일 삭제
  deleteTodo: async (id: string): Promise<Todo[]> => {
    const todos = await todoService.getTodos();
    // 삭제된 할 일을 제외하고, 다른 할 일들의 선행 작업 목록에서도 해당 ID를 제거하여 데이터 무결성 유지
    const updated = todos
      .filter(todo => todo.id !== id)
      .map(todo => {
        if (!todo.prerequisites?.includes(id)) return todo;
        return {
          ...todo,
          prerequisites: todo.prerequisites.filter(pId => pId !== id)
        };
      });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // 할 일 수정 (상세 정보 등)
  updateTodo: async (id: string, updates: Partial<Todo>): Promise<Todo[]> => {
    const todos = await todoService.getTodos();
    const updated = todos.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // 전체 저장 (UI 상태 동기화용)
  saveAll: async (todos: Todo[]): Promise<void> => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }
};