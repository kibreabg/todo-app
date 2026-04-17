namespace todo_backend.Application.Todos;

public sealed record TodoDto(
    Guid Id,
    string Title,
    bool Completed,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);
