using todo_backend.Application.Common.Interfaces;
using todo_backend.Domain.Entities;

namespace todo_backend.Application.Todos;

public sealed class TodoService(ITodoRepository todoRepository) : ITodoService
{
    public async Task<IReadOnlyList<TodoDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var todos = await todoRepository.GetAllAsync(cancellationToken);
        return todos.Select(Map).ToList();
    }

    public async Task<TodoDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var todo = await todoRepository.GetByIdAsync(id, cancellationToken);
        return todo is null ? null : Map(todo);
    }

    public async Task<TodoDto> CreateAsync(string title, bool completed = false, CancellationToken cancellationToken = default)
    {
        var todo = new Todo(title, completed);

        await todoRepository.AddAsync(todo, cancellationToken);
        return Map(todo);
    }

    public async Task<TodoDto?> UpdateAsync(Guid id, string title, bool completed, CancellationToken cancellationToken = default)
    {
        var todo = await todoRepository.GetByIdAsync(id, cancellationToken);
        if (todo is null)
        {
            return null;
        }

        todo.Update(title, completed);
        await todoRepository.UpdateAsync(todo, cancellationToken);

        return Map(todo);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await todoRepository.DeleteAsync(id, cancellationToken);
    }

    private static TodoDto Map(Todo todo)
    {
        return new TodoDto(todo.Id, todo.Title, todo.Completed, todo.CreatedAt, todo.UpdatedAt);
    }
}
