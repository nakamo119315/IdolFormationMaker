using IdolManagement.Application.Shared;
using IdolManagement.Application.Songs.Commands;
using IdolManagement.Application.Songs.DTOs;
using IdolManagement.Application.Songs.Queries;
using Microsoft.AspNetCore.Mvc;

namespace IdolManagement.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SongsController : ControllerBase
{
    private readonly GetAllSongsHandler _getAllHandler;
    private readonly GetSongsPagedHandler _getPagedHandler;
    private readonly GetSongHandler _getHandler;
    private readonly GetSongsByGroupHandler _getByGroupHandler;
    private readonly CreateSongHandler _createHandler;
    private readonly UpdateSongHandler _updateHandler;
    private readonly DeleteSongHandler _deleteHandler;
    private readonly DeleteSongsBulkHandler _deleteBulkHandler;
    private readonly ExportSongsCsvHandler _exportCsvHandler;

    public SongsController(
        GetAllSongsHandler getAllHandler,
        GetSongsPagedHandler getPagedHandler,
        GetSongHandler getHandler,
        GetSongsByGroupHandler getByGroupHandler,
        CreateSongHandler createHandler,
        UpdateSongHandler updateHandler,
        DeleteSongHandler deleteHandler,
        DeleteSongsBulkHandler deleteBulkHandler,
        ExportSongsCsvHandler exportCsvHandler)
    {
        _getAllHandler = getAllHandler;
        _getPagedHandler = getPagedHandler;
        _getHandler = getHandler;
        _getByGroupHandler = getByGroupHandler;
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
        _deleteBulkHandler = deleteBulkHandler;
        _exportCsvHandler = exportCsvHandler;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SongSummaryDto>>> GetAll(CancellationToken cancellationToken)
    {
        var songs = await _getAllHandler.HandleAsync(new GetAllSongsQuery(), cancellationToken);
        return Ok(songs);
    }

    [HttpGet("paged")]
    public async Task<ActionResult<PagedResult<SongSummaryDto>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? groupId = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetSongsPagedQuery(page, pageSize, search, groupId);
        var result = await _getPagedHandler.HandleAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportCsv(CancellationToken cancellationToken)
    {
        var csv = await _exportCsvHandler.HandleAsync(new ExportSongsCsvQuery(), cancellationToken);
        return File(csv, "text/csv", $"songs_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SongDto>> Get(Guid id, CancellationToken cancellationToken)
    {
        var song = await _getHandler.HandleAsync(new GetSongQuery(id), cancellationToken);
        if (song == null)
            return NotFound();
        return Ok(song);
    }

    [HttpGet("group/{groupId:guid}")]
    public async Task<ActionResult<IEnumerable<SongSummaryDto>>> GetByGroup(Guid groupId, CancellationToken cancellationToken)
    {
        var songs = await _getByGroupHandler.HandleAsync(new GetSongsByGroupQuery(groupId), cancellationToken);
        return Ok(songs);
    }

    [HttpPost]
    public async Task<ActionResult<SongDto>> Create([FromBody] CreateSongDto dto, CancellationToken cancellationToken)
    {
        var song = await _createHandler.HandleAsync(new CreateSongCommand(dto), cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = song.Id }, song);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SongDto>> Update(Guid id, [FromBody] UpdateSongDto dto, CancellationToken cancellationToken)
    {
        var song = await _updateHandler.HandleAsync(new UpdateSongCommand(id, dto), cancellationToken);
        if (song == null)
            return NotFound();
        return Ok(song);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _deleteHandler.HandleAsync(new DeleteSongCommand(id), cancellationToken);
        if (!result)
            return NotFound();
        return NoContent();
    }

    [HttpDelete("bulk")]
    public async Task<ActionResult<object>> DeleteBulk([FromBody] BulkDeleteRequest request, CancellationToken cancellationToken)
    {
        var deletedCount = await _deleteBulkHandler.HandleAsync(
            new DeleteSongsBulkCommand(request.Ids), cancellationToken);
        return Ok(new { deletedCount });
    }
}
