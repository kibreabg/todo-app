export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertTodoPayload {
  title: string;
  completed: boolean;
}
