namespace todo_backend.Api.Contracts;

public sealed record LoginRequest(
    string Email,
    string Password);
