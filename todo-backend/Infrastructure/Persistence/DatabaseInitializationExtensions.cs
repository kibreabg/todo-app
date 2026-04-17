using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using todo_backend.Domain.Entities;

namespace todo_backend.Infrastructure.Persistence;

public static class DatabaseInitializationExtensions
{
    public static async Task InitializeDatabaseAsync(this IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await dbContext.Database.MigrateAsync();

        if (await dbContext.Todos.AnyAsync())
        {
            return;
        }

        var seedTodos = new[]
        {
            new Todo("Set up PostgreSQL database"),
            new Todo("Build Todo API", completed: true),
            new Todo("Connect frontend to backend")
        };

        await dbContext.Todos.AddRangeAsync(seedTodos);
        await dbContext.SaveChangesAsync();
    }
}
