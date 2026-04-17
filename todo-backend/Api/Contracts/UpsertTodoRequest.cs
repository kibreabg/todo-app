namespace todo_backend.Api.Contracts;

public sealed record UpsertTodoRequest(string Title, bool Completed);
