using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace todo_backend.Infrastructure.Persistence;

public static class DatabaseInitializationExtensions
{
    public static async Task InitializeDatabaseAsync(this IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await dbContext.Database.MigrateAsync();
    }
}
