using IdolManagement.Application.Setlists.Commands;
using IdolManagement.Application.Setlists.DTOs;
using IdolManagement.Application.Setlists.Queries;
using Microsoft.AspNetCore.Mvc;

namespace IdolManagement.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SetlistsController : ControllerBase
{
    private readonly GetAllSetlistsHandler _getAllHandler;
    private readonly GetSetlistHandler _getHandler;
    private readonly GetSetlistsByGroupHandler _getByGroupHandler;
    private readonly CreateSetlistHandler _createHandler;
    private readonly UpdateSetlistHandler _updateHandler;
    private readonly DeleteSetlistHandler _deleteHandler;

    public SetlistsController(
        GetAllSetlistsHandler getAllHandler,
        GetSetlistHandler getHandler,
        GetSetlistsByGroupHandler getByGroupHandler,
        CreateSetlistHandler createHandler,
        UpdateSetlistHandler updateHandler,
        DeleteSetlistHandler deleteHandler)
    {
        _getAllHandler = getAllHandler;
        _getHandler = getHandler;
        _getByGroupHandler = getByGroupHandler;
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SetlistSummaryDto>>> GetAll(CancellationToken cancellationToken)
    {
        var setlists = await _getAllHandler.HandleAsync(new GetAllSetlistsQuery(), cancellationToken);
        return Ok(setlists);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SetlistDto>> Get(Guid id, CancellationToken cancellationToken)
    {
        var setlist = await _getHandler.HandleAsync(new GetSetlistQuery(id), cancellationToken);
        if (setlist == null)
            return NotFound();
        return Ok(setlist);
    }

    [HttpGet("group/{groupId:guid}")]
    public async Task<ActionResult<IEnumerable<SetlistSummaryDto>>> GetByGroup(Guid groupId, CancellationToken cancellationToken)
    {
        var setlists = await _getByGroupHandler.HandleAsync(new GetSetlistsByGroupQuery(groupId), cancellationToken);
        return Ok(setlists);
    }

    [HttpPost]
    public async Task<ActionResult<SetlistDto>> Create([FromBody] CreateSetlistDto dto, CancellationToken cancellationToken)
    {
        var setlist = await _createHandler.HandleAsync(new CreateSetlistCommand(dto), cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = setlist.Id }, setlist);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SetlistDto>> Update(Guid id, [FromBody] UpdateSetlistDto dto, CancellationToken cancellationToken)
    {
        var setlist = await _updateHandler.HandleAsync(new UpdateSetlistCommand(id, dto), cancellationToken);
        if (setlist == null)
            return NotFound();
        return Ok(setlist);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _deleteHandler.HandleAsync(new DeleteSetlistCommand(id), cancellationToken);
        if (!result)
            return NotFound();
        return NoContent();
    }
}
