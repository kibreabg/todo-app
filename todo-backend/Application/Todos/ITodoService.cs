namespace todo_backend.Application.Todos;

public interface ITodoService
{
    Task<IReadOnlyList<TodoDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default);

    Task<TodoDto?> GetByIdAsync(Guid id, string userId, CancellationToken cancellationToken = default);

    Task<TodoDto> CreateAsync(string title, string userId, bool completed = false, CancellationToken cancellationToken = default);

    Task<TodoDto?> UpdateAsync(Guid id, string title, bool completed, string userId, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, string userId, CancellationToken cancellationToken = default);
}
