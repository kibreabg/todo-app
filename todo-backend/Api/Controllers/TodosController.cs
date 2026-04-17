using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using todo_backend.Api.Contracts;
using todo_backend.Application.Todos;

namespace todo_backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class TodosController(ITodoService todoService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TodoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<TodoDto>>> GetAll(CancellationToken cancellationToken)
    {
        var userId = GetRequiredUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var todos = await todoService.GetAllAsync(userId, cancellationToken);
        return Ok(todos);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TodoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TodoDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetRequiredUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var todo = await todoService.GetByIdAsync(id, userId, cancellationToken);
        if (todo is null)
        {
            return NotFound();
        }

        return Ok(todo);
    }

    [HttpPost]
    [ProducesResponseType(typeof(TodoDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<TodoDto>> Create([FromBody] UpsertTodoRequest request, CancellationToken cancellationToken)
    {
        var userId = GetRequiredUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var created = await todoService.CreateAsync(request.Title, userId, request.Completed, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TodoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TodoDto>> Update(Guid id, [FromBody] UpsertTodoRequest request, CancellationToken cancellationToken)
    {
        var userId = GetRequiredUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var updated = await todoService.UpdateAsync(id, request.Title, request.Completed, userId, cancellationToken);
        if (updated is null)
        {
            return NotFound();
        }

        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetRequiredUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var deleted = await todoService.DeleteAsync(id, userId, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    private string? GetRequiredUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
    }
}
