using IdolManagement.Application.Groups.Commands;
using IdolManagement.Application.Groups.DTOs;
using IdolManagement.Application.Groups.Queries;
using Microsoft.AspNetCore.Mvc;

namespace IdolManagement.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GroupsController : ControllerBase
{
    private readonly GetAllGroupsHandler _getAllHandler;
    private readonly GetGroupHandler _getHandler;
    private readonly CreateGroupHandler _createHandler;
    private readonly UpdateGroupHandler _updateHandler;
    private readonly DeleteGroupHandler _deleteHandler;

    public GroupsController(
        GetAllGroupsHandler getAllHandler,
        GetGroupHandler getHandler,
        CreateGroupHandler createHandler,
        UpdateGroupHandler updateHandler,
        DeleteGroupHandler deleteHandler)
    {
        _getAllHandler = getAllHandler;
        _getHandler = getHandler;
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GroupSummaryDto>>> GetAll(CancellationToken cancellationToken)
    {
        var groups = await _getAllHandler.HandleAsync(new GetAllGroupsQuery(), cancellationToken);
        return Ok(groups);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<GroupDto>> Get(Guid id, CancellationToken cancellationToken)
    {
        var group = await _getHandler.HandleAsync(new GetGroupQuery(id), cancellationToken);
        if (group == null)
            return NotFound();
        return Ok(group);
    }

    [HttpPost]
    public async Task<ActionResult<GroupDto>> Create([FromBody] CreateGroupDto dto, CancellationToken cancellationToken)
    {
        var group = await _createHandler.HandleAsync(new CreateGroupCommand(dto), cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = group.Id }, group);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<GroupDto>> Update(Guid id, [FromBody] UpdateGroupDto dto, CancellationToken cancellationToken)
    {
        var group = await _updateHandler.HandleAsync(new UpdateGroupCommand(id, dto), cancellationToken);
        if (group == null)
            return NotFound();
        return Ok(group);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _deleteHandler.HandleAsync(new DeleteGroupCommand(id), cancellationToken);
        if (!result)
            return NotFound();
        return NoContent();
    }
}
