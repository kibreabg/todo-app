using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using todo_backend.Application.Common.Interfaces;
using todo_backend.Infrastructure.Persistence;

namespace todo_backend.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("TodoDatabase")
            ?? throw new InvalidOperationException("Connection string 'TodoDatabase' was not found.");

        services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
        services.AddScoped<ITodoRepository, TodoRepository>();

        return services;
    }
}
