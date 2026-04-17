using Microsoft.EntityFrameworkCore;
using todo_backend.Application.Common.Interfaces;
using todo_backend.Domain.Entities;

namespace todo_backend.Infrastructure.Persistence;

public sealed class TodoRepository(AppDbContext dbContext) : ITodoRepository
{
    public async Task<IReadOnlyList<Todo>> GetAllAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Todos
            .AsNoTracking()
            .Where(todo => todo.UserId == userId)
            .OrderByDescending(todo => todo.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Todo?> GetByIdAsync(Guid id, string userId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Todos
            .FirstOrDefaultAsync(todo => todo.Id == id && todo.UserId == userId, cancellationToken);
    }

    public async Task AddAsync(Todo todo, CancellationToken cancellationToken = default)
    {
        await dbContext.Todos.AddAsync(todo, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Todo todo, CancellationToken cancellationToken = default)
    {
        dbContext.Todos.Update(todo);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, string userId, CancellationToken cancellationToken = default)
    {
        var todo = await dbContext.Todos
            .FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId, cancellationToken);
        if (todo is null)
        {
            return false;
        }

        dbContext.Todos.Remove(todo);
        await dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
