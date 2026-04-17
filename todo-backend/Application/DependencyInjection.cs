using Microsoft.Extensions.DependencyInjection;
using todo_backend.Application.Todos;

namespace todo_backend.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ITodoService, TodoService>();
        return services;
    }
}
