using todo_backend.Domain.Entities;

namespace todo_backend.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(ApplicationUser user);
}
