namespace todo_backend.Domain.Entities;

public sealed class Todo
{
    public Guid Id { get; private set; }

    public string Title { get; private set; } = string.Empty;

    public bool Completed { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; }

    public DateTimeOffset UpdatedAt { get; private set; }

    public string? UserId { get; private set; }

    public ApplicationUser? User { get; private set; }

    private Todo()
    {
    }

    public Todo(string title, bool completed = false, string? userId = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        var nowUtc = DateTimeOffset.UtcNow;

        Id = Guid.NewGuid();
        Title = title.Trim();
        Completed = completed;
        UserId = userId;
        CreatedAt = nowUtc;
        UpdatedAt = nowUtc;
    }

    public void Update(string title, bool completed)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        Title = title.Trim();
        Completed = completed;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
