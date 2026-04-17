using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using todo_backend.Application.Common.Interfaces;
using todo_backend.Domain.Entities;
using todo_backend.Infrastructure.Persistence;

namespace todo_backend.Infrastructure.Auth;

public sealed class RefreshTokenService(
    AppDbContext dbContext,
    TimeProvider timeProvider,
    IOptions<JwtOptions> jwtOptionsAccessor) : IRefreshTokenService
{
    private readonly JwtOptions _jwtOptions = jwtOptionsAccessor.Value;

    public async Task<string> IssueTokenAsync(ApplicationUser user, CancellationToken cancellationToken = default)
    {
        var rawToken = GenerateSecureToken();
        var tokenHash = ComputeHash(rawToken);
        var expiresAtUtc = timeProvider.GetUtcNow().AddDays(_jwtOptions.RefreshTokenLifetimeDays);

        var refreshToken = new RefreshToken(user.Id, tokenHash, expiresAtUtc);
        await dbContext.Set<RefreshToken>().AddAsync(refreshToken, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return rawToken;
    }

    public async Task<(ApplicationUser User, string RefreshToken)?> RotateTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return null;
        }

        var tokenHash = ComputeHash(refreshToken);

        var currentToken = await dbContext.Set<RefreshToken>()
            .Include(token => token.User)
            .FirstOrDefaultAsync(token => token.TokenHash == tokenHash, cancellationToken);

        if (currentToken is null || !currentToken.IsActive)
        {
            return null;
        }

        var nextRawToken = GenerateSecureToken();
        var nextHash = ComputeHash(nextRawToken);
        var nextExpiresAtUtc = timeProvider.GetUtcNow().AddDays(_jwtOptions.RefreshTokenLifetimeDays);

        currentToken.Revoke(nextHash);

        var replacementToken = new RefreshToken(currentToken.UserId, nextHash, nextExpiresAtUtc);
        await dbContext.Set<RefreshToken>().AddAsync(replacementToken, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return (currentToken.User, nextRawToken);
    }

    public async Task RevokeTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        var tokenHash = ComputeHash(refreshToken);
        var token = await dbContext.Set<RefreshToken>()
            .FirstOrDefaultAsync(item => item.TokenHash == tokenHash, cancellationToken);

        if (token is null || !token.IsActive)
        {
            return;
        }

        token.Revoke();
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static string GenerateSecureToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    private static string ComputeHash(string rawToken)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(rawToken);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash);
    }
}
