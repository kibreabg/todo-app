namespace todo_backend.Application.Todos;

public interface ITodoService
{
    Task<IReadOnlyList<TodoDto>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<TodoDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<TodoDto> CreateAsync(string title, bool completed = false, CancellationToken cancellationToken = default);

    Task<TodoDto?> UpdateAsync(Guid id, string title, bool completed, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
