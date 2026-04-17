using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using todo_backend.Api.Contracts;
using todo_backend.Application.Common.Interfaces;
using todo_backend.Domain.Entities;
using todo_backend.Infrastructure.Auth;

namespace todo_backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IJwtTokenGenerator jwtTokenGenerator,
    IRefreshTokenService refreshTokenService,
    IOptions<JwtOptions> jwtOptionsAccessor) : ControllerBase
{
    private readonly JwtOptions _jwtOptions = jwtOptionsAccessor.Value;

    [AllowAnonymous]
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Email and password are required.");
        }

        var existingUser = await userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
        {
            return BadRequest("An account with this email already exists.");
        }

        var user = new ApplicationUser
        {
            Email = request.Email.Trim(),
            UserName = string.IsNullOrWhiteSpace(request.UserName) ? request.Email.Trim() : request.UserName.Trim()
        };

        var createResult = await userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest(createResult.Errors.Select(error => error.Description));
        }

        return CreatedAtAction(nameof(Me), new { }, await CreateAndSetAuthCookiesAsync(user, cancellationToken));
    }

    [AllowAnonymous]
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return Unauthorized();
        }

        var passwordCheckResult = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!passwordCheckResult.Succeeded)
        {
            return Unauthorized();
        }

        return Ok(await CreateAndSetAuthCookiesAsync(user, cancellationToken));
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Refresh(CancellationToken cancellationToken)
    {
        if (!Request.Cookies.TryGetValue(_jwtOptions.RefreshTokenCookieName, out var rawRefreshToken) ||
            string.IsNullOrWhiteSpace(rawRefreshToken))
        {
            return Unauthorized();
        }

        var rotated = await refreshTokenService.RotateTokenAsync(rawRefreshToken, cancellationToken);
        if (rotated is null)
        {
            DeleteAuthCookies();
            return Unauthorized();
        }

        return Ok(SetAuthCookies(rotated.Value.User, rotated.Value.RefreshToken));
    }

    [AllowAnonymous]
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        if (Request.Cookies.TryGetValue(_jwtOptions.RefreshTokenCookieName, out var rawRefreshToken) &&
            !string.IsNullOrWhiteSpace(rawRefreshToken))
        {
            await refreshTokenService.RevokeTokenAsync(rawRefreshToken, cancellationToken);
        }

        DeleteAuthCookies();
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Me()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(new AuthResponse(
            user.Id,
            user.Email ?? string.Empty,
            user.UserName ?? string.Empty,
            DateTimeOffset.UtcNow.AddMinutes(_jwtOptions.AccessTokenLifetimeMinutes)));
    }

    private async Task<AuthResponse> CreateAndSetAuthCookiesAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var refreshToken = await refreshTokenService.IssueTokenAsync(user, cancellationToken);
        return SetAuthCookies(user, refreshToken);
    }

    private AuthResponse SetAuthCookies(ApplicationUser user, string refreshToken)
    {
        var accessTokenExpiresAtUtc = DateTimeOffset.UtcNow.AddMinutes(_jwtOptions.AccessTokenLifetimeMinutes);
        var refreshTokenExpiresAtUtc = DateTimeOffset.UtcNow.AddDays(_jwtOptions.RefreshTokenLifetimeDays);
        var token = jwtTokenGenerator.GenerateToken(user);

        Response.Cookies.Append(_jwtOptions.AccessTokenCookieName, token, new CookieOptions
        {
            HttpOnly = true,
            IsEssential = true,
            SameSite = SameSiteMode.Lax,
            Secure = Request.IsHttps,
            Expires = accessTokenExpiresAtUtc,
            Path = "/"
        });

        Response.Cookies.Append(_jwtOptions.RefreshTokenCookieName, refreshToken, new CookieOptions
        {
            HttpOnly = true,
            IsEssential = true,
            SameSite = SameSiteMode.Lax,
            Secure = Request.IsHttps,
            Expires = refreshTokenExpiresAtUtc,
            Path = "/"
        });

        return new AuthResponse(
            user.Id,
            user.Email ?? string.Empty,
            user.UserName ?? string.Empty,
            accessTokenExpiresAtUtc);
    }

    private void DeleteAuthCookies()
    {
        Response.Cookies.Delete(_jwtOptions.AccessTokenCookieName);
        Response.Cookies.Delete(_jwtOptions.RefreshTokenCookieName);
    }
}
