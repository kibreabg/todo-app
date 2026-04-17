using todo_backend.Domain.Entities;

namespace todo_backend.Application.Common.Interfaces;

public interface IRefreshTokenService
{
    Task<string> IssueTokenAsync(ApplicationUser user, CancellationToken cancellationToken = default);

    Task<(ApplicationUser User, string RefreshToken)?> RotateTokenAsync(string refreshToken, CancellationToken cancellationToken = default);

    Task RevokeTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
}
