using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using todo_backend.Application.Todos;

namespace todo_backend.IntegrationTests.Infrastructure;

public sealed class TodoApiFactory : WebApplicationFactory<Program>
{
    public ITodoService TodoServiceMock { get; } = Substitute.For<ITodoService>();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            var values = new Dictionary<string, string?>
            {
                ["ConnectionStrings:TodoDatabase"] = "Host=localhost;Database=todo_test;Username=test;Password=test",
                ["Jwt:Issuer"] = "todo-tests",
                ["Jwt:Audience"] = "todo-tests",
                ["Jwt:SigningKey"] = "01234567890123456789012345678901",
                ["Jwt:AccessTokenLifetimeMinutes"] = "15",
                ["Jwt:RefreshTokenLifetimeDays"] = "14",
                ["Jwt:AccessTokenCookieName"] = "todo_auth",
                ["Jwt:RefreshTokenCookieName"] = "todo_refresh"
            };

            config.AddInMemoryCollection(values);
        });

        builder.ConfigureTestServices(services =>
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
            }).AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, _ => { });

            services.AddSingleton(TodoServiceMock);
        });
    }
}
