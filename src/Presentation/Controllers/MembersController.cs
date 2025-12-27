using IdolManagement.Application.Members.Commands;
using IdolManagement.Application.Members.DTOs;
using IdolManagement.Application.Members.Queries;
using IdolManagement.Application.Shared;
using Microsoft.AspNetCore.Mvc;

namespace IdolManagement.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MembersController : ControllerBase
{
    private readonly GetAllMembersHandler _getAllHandler;
    private readonly GetMembersPagedHandler _getPagedHandler;
    private readonly GetMemberHandler _getHandler;
    private readonly CreateMemberHandler _createHandler;
    private readonly UpdateMemberHandler _updateHandler;
    private readonly DeleteMemberHandler _deleteHandler;
    private readonly AddMemberImageHandler _addImageHandler;
    private readonly DeleteMemberImageHandler _deleteImageHandler;
    private readonly ExportMembersCsvHandler _exportCsvHandler;

    public MembersController(
        GetAllMembersHandler getAllHandler,
        GetMembersPagedHandler getPagedHandler,
        GetMemberHandler getHandler,
        CreateMemberHandler createHandler,
        UpdateMemberHandler updateHandler,
        DeleteMemberHandler deleteHandler,
        AddMemberImageHandler addImageHandler,
        DeleteMemberImageHandler deleteImageHandler,
        ExportMembersCsvHandler exportCsvHandler)
    {
        _getAllHandler = getAllHandler;
        _getPagedHandler = getPagedHandler;
        _getHandler = getHandler;
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
        _addImageHandler = addImageHandler;
        _deleteImageHandler = deleteImageHandler;
        _exportCsvHandler = exportCsvHandler;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetAll(CancellationToken cancellationToken)
    {
        var members = await _getAllHandler.HandleAsync(new GetAllMembersQuery(), cancellationToken);
        return Ok(members);
    }

    [HttpGet("paged")]
    public async Task<ActionResult<PagedResult<MemberDto>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? groupId = null,
        [FromQuery] int? generation = null,
        [FromQuery] bool? isGraduated = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetMembersPagedQuery(page, pageSize, search, groupId, generation, isGraduated);
        var result = await _getPagedHandler.HandleAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportCsv(CancellationToken cancellationToken)
    {
        var csv = await _exportCsvHandler.HandleAsync(new ExportMembersCsvQuery(), cancellationToken);
        return File(csv, "text/csv", $"members_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MemberDto>> Get(Guid id, CancellationToken cancellationToken)
    {
        var member = await _getHandler.HandleAsync(new GetMemberQuery(id), cancellationToken);
        if (member == null)
            return NotFound();
        return Ok(member);
    }

    [HttpPost]
    public async Task<ActionResult<MemberDto>> Create([FromBody] CreateMemberDto dto, CancellationToken cancellationToken)
    {
        var member = await _createHandler.HandleAsync(new CreateMemberCommand(dto), cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = member.Id }, member);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<MemberDto>> Update(Guid id, [FromBody] UpdateMemberDto dto, CancellationToken cancellationToken)
    {
        var member = await _updateHandler.HandleAsync(new UpdateMemberCommand(id, dto), cancellationToken);
        if (member == null)
            return NotFound();
        return Ok(member);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _deleteHandler.HandleAsync(new DeleteMemberCommand(id), cancellationToken);
        if (!result)
            return NotFound();
        return NoContent();
    }

    [HttpPost("{id:guid}/images")]
    public async Task<ActionResult<MemberImageDto>> AddImage(Guid id, [FromBody] AddMemberImageDto dto, CancellationToken cancellationToken)
    {
        var image = await _addImageHandler.HandleAsync(new AddMemberImageCommand(id, dto), cancellationToken);
        if (image == null)
            return NotFound();
        return Created($"/api/members/{id}/images/{image.Id}", image);
    }

    [HttpDelete("{id:guid}/images/{imageId:guid}")]
    public async Task<IActionResult> DeleteImage(Guid id, Guid imageId, CancellationToken cancellationToken)
    {
        var result = await _deleteImageHandler.HandleAsync(new DeleteMemberImageCommand(id, imageId), cancellationToken);
        if (!result)
            return NotFound();
        return NoContent();
    }
}
