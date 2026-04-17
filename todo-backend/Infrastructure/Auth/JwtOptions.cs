namespace todo_backend.Infrastructure.Auth;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = string.Empty;

    public string Audience { get; init; } = string.Empty;

    public string SigningKey { get; init; } = string.Empty;

    public int AccessTokenLifetimeMinutes { get; init; } = 15;

    public int RefreshTokenLifetimeDays { get; init; } = 14;

    public string AccessTokenCookieName { get; init; } = "todo_auth";

    public string RefreshTokenCookieName { get; init; } = "todo_refresh";
}
