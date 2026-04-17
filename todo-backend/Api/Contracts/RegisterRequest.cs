namespace todo_backend.Api.Contracts;

public sealed record RegisterRequest(
    string Email,
    string Password,
    string? UserName = null);
