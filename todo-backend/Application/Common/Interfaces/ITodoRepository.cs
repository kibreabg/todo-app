using todo_backend.Domain.Entities;

namespace todo_backend.Application.Common.Interfaces;

public interface ITodoRepository
{
    Task<IReadOnlyList<Todo>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<Todo?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(Todo todo, CancellationToken cancellationToken = default);

    Task UpdateAsync(Todo todo, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
