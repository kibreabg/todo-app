namespace todo_backend.Domain.Entities;

public sealed class RefreshToken
{
    public Guid Id { get; private set; }

    public string UserId { get; private set; } = string.Empty;

    public ApplicationUser User { get; private set; } = null!;

    public string TokenHash { get; private set; } = string.Empty;

    public DateTimeOffset ExpiresAtUtc { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset? RevokedAtUtc { get; private set; }

    public string? ReplacedByTokenHash { get; private set; }

    private RefreshToken()
    {
    }

    public RefreshToken(string userId, string tokenHash, DateTimeOffset expiresAtUtc)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);
        ArgumentException.ThrowIfNullOrWhiteSpace(tokenHash);

        Id = Guid.NewGuid();
        UserId = userId;
        TokenHash = tokenHash;
        ExpiresAtUtc = expiresAtUtc;
        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public bool IsActive => RevokedAtUtc is null && ExpiresAtUtc > DateTimeOffset.UtcNow;

    public void Revoke(string? replacedByTokenHash = null)
    {
        RevokedAtUtc = DateTimeOffset.UtcNow;
        ReplacedByTokenHash = replacedByTokenHash;
    }
}
