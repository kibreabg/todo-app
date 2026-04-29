using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using NSubstitute;
using todo_backend.Api.Contracts;
using todo_backend.Application.Todos;
using todo_backend.IntegrationTests.Infrastructure;
using Xunit;

namespace todo_backend.IntegrationTests;

public sealed class TodoEndpointsTests : IClassFixture<TodoApiFactory>
{
    private readonly HttpClient _client;
    private readonly ITodoService _todoService;

    public TodoEndpointsTests(TodoApiFactory factory)
    {
        _client = factory.CreateClient();
        _todoService = factory.TodoServiceMock;
    }

    [Fact]
    public async Task Get_healthz_returns_ok_status()
    {
        var response = await _client.GetAsync("/healthz");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Get_todos_without_auth_returns_unauthorized()
    {
        var response = await _client.GetAsync("/api/todos");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Get_todos_with_auth_returns_mapped_payload()
    {
        const string userId = "integration-user-1";
        var expected = new List<TodoDto>
        {
            new(Guid.NewGuid(), "Integration task", false, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow)
        };

        _todoService.GetAllAsync(userId, Arg.Any<CancellationToken>())
            .Returns(expected);

        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/todos");
        request.Headers.Add(TestAuthHandler.UserIdHeader, userId);

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<List<TodoDto>>();
        Assert.NotNull(payload);
        payload.Should().HaveCount(1);
        payload[0].Title.Should().Be("Integration task");

        await _todoService.Received(1).GetAllAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Post_todos_with_auth_returns_created()
    {
        const string userId = "integration-user-2";
        var created = new TodoDto(Guid.NewGuid(), "Created via API", true, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);

        _todoService.CreateAsync("Created via API", userId, true, Arg.Any<CancellationToken>())
            .Returns(created);

        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/todos")
        {
            Content = JsonContent.Create(new UpsertTodoRequest("Created via API", true))
        };
        request.Headers.Add(TestAuthHandler.UserIdHeader, userId);

        var response = await _client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();

        var payload = await response.Content.ReadFromJsonAsync<TodoDto>();
        payload.Should().NotBeNull();
        payload!.Title.Should().Be("Created via API");

        await _todoService.Received(1)
            .CreateAsync("Created via API", userId, true, Arg.Any<CancellationToken>());
    }
}
