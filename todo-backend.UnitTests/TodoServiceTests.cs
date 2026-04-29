using AutoFixture;
using AutoFixture.AutoNSubstitute;
using FluentAssertions;
using NSubstitute;
using todo_backend.Application.Common.Interfaces;
using todo_backend.Application.Todos;
using todo_backend.Domain.Entities;
using Xunit;

namespace todo_backend.UnitTests;

public sealed class TodoServiceTests
{
    private readonly IFixture _fixture;
    private readonly ITodoRepository _todoRepository;
    private readonly TodoService _sut;

    public TodoServiceTests()
    {
        _fixture = new Fixture().Customize(new AutoNSubstituteCustomization());
        _todoRepository = _fixture.Freeze<ITodoRepository>();
        _sut = new TodoService(_todoRepository);
    }

    [Fact]
    public async Task GetAllAsync_should_return_mapped_todos_for_user()
    {
        var userId = _fixture.Create<string>();
        var todoOne = new Todo("  Buy milk  ", false, userId);
        var todoTwo = new Todo("Learn testing", true, userId);
        IReadOnlyList<Todo> todos = [todoOne, todoTwo];

        _todoRepository.GetAllAsync(userId, Arg.Any<CancellationToken>())
            .Returns(todos);

        var result = await _sut.GetAllAsync(userId);

        result.Should().HaveCount(2);
        result.Select(t => t.Title).Should().ContainInOrder("Buy milk", "Learn testing");
        result.Select(t => t.Completed).Should().ContainInOrder(false, true);
    }

    [Fact]
    public async Task GetByIdAsync_should_return_null_when_repository_returns_null()
    {
        var userId = _fixture.Create<string>();
        var todoId = Guid.NewGuid();

        _todoRepository.GetByIdAsync(todoId, userId, Arg.Any<CancellationToken>())
            .Returns((Todo?)null);

        var result = await _sut.GetByIdAsync(todoId, userId);

        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateAsync_should_persist_todo_and_return_mapped_dto()
    {
        var userId = _fixture.Create<string>();
        var title = "  Write tests  ";

        var result = await _sut.CreateAsync(title, userId, completed: true);

        result.Title.Should().Be("Write tests");
        result.Completed.Should().BeTrue();

        await _todoRepository.Received(1)
            .AddAsync(Arg.Is<Todo>(t =>
                t.Title == "Write tests" &&
                t.Completed &&
                t.UserId == userId), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAsync_should_return_null_when_todo_is_missing()
    {
        var userId = _fixture.Create<string>();
        var todoId = Guid.NewGuid();

        _todoRepository.GetByIdAsync(todoId, userId, Arg.Any<CancellationToken>())
            .Returns((Todo?)null);

        var result = await _sut.UpdateAsync(todoId, "New title", true, userId);

        result.Should().BeNull();
        await _todoRepository.DidNotReceiveWithAnyArgs().UpdateAsync(default!, default);
    }

    [Fact]
    public async Task UpdateAsync_should_update_and_persist_existing_todo()
    {
        var userId = _fixture.Create<string>();
        var todoId = Guid.NewGuid();
        var existingTodo = new Todo("Old", false, userId);

        _todoRepository.GetByIdAsync(todoId, userId, Arg.Any<CancellationToken>())
            .Returns(existingTodo);

        var result = await _sut.UpdateAsync(todoId, "  New title  ", true, userId);

        result.Should().NotBeNull();
        result!.Title.Should().Be("New title");
        result.Completed.Should().BeTrue();

        await _todoRepository.Received(1).UpdateAsync(existingTodo, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAsync_should_return_repository_result()
    {
        var userId = _fixture.Create<string>();
        var todoId = Guid.NewGuid();

        _todoRepository.DeleteAsync(todoId, userId, Arg.Any<CancellationToken>())
            .Returns(true);

        var result = await _sut.DeleteAsync(todoId, userId);

        result.Should().BeTrue();
        await _todoRepository.Received(1).DeleteAsync(todoId, userId, Arg.Any<CancellationToken>());
    }
}
