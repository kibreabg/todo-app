namespace todo_backend.Api.Contracts;

public sealed record AuthResponse(
    string UserId,
    string Email,
    string UserName,
    DateTimeOffset ExpiresAtUtc);
