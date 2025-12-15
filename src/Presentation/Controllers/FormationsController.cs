using IdolManagement.Application.Formations.Commands;
using IdolManagement.Application.Formations.DTOs;
using IdolManagement.Application.Formations.Queries;
using Microsoft.AspNetCore.Mvc;

namespace IdolManagement.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FormationsController : ControllerBase
{
    private readonly GetAllFormationsHandler _getAllHandler;
    private readonly GetFormationHandler _getHandler;
    private readonly CreateFormationHandler _createHandler;
    private readonly UpdateFormationHandler _updateHandler;
    private readonly DeleteFormationHandler _deleteHandler;

    public FormationsController(
        GetAllFormationsHandler getAllHandler,
        GetFormationHandler getHandler,
        CreateFormationHandler createHandler,
        UpdateFormationHandler updateHandler,
        DeleteFormationHandler deleteHandler)
    {
        _getAllHandler = getAllHandler;
        _getHandler = getHandler;
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FormationDto>>> GetAll(CancellationToken cancellationToken)
    {
        var formations = await _getAllHandler.HandleAsync(new GetAllFormationsQuery(), cancellationToken);
        return Ok(formations);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FormationDto>> Get(Guid id, CancellationToken cancellationToken)
    {
        var formation = await _getHandler.HandleAsync(new GetFormationQuery(id), cancellationToken);
        if (formation == null)
            return NotFound();
        return Ok(formation);
    }

    [HttpPost]
    public async Task<ActionResult<FormationDto>> Create([FromBody] CreateFormationDto dto, CancellationToken cancellationToken)
    {
        var formation = await _createHandler.HandleAsync(new CreateFormationCommand(dto), cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = formation.Id }, formation);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<FormationDto>> Update(Guid id, [FromBody] UpdateFormationDto dto, CancellationToken cancellationToken)
    {
        var formation = await _updateHandler.HandleAsync(new UpdateFormationCommand(id, dto), cancellationToken);
        if (formation == null)
            return NotFound();
        return Ok(formation);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _deleteHandler.HandleAsync(new DeleteFormationCommand(id), cancellationToken);
        if (!result)
            return NotFound();
        return NoContent();
    }
}
