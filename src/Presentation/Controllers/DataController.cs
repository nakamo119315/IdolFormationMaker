using IdolManagement.Application.Data.DTOs;
using IdolManagement.Application.Data.Queries;
using IdolManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;

namespace IdolManagement.Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DataController : ControllerBase
{
    private readonly ExportDataHandler _exportHandler;
    private readonly ImportDataHandler _importHandler;

    public DataController(
        ExportDataHandler exportHandler,
        ImportDataHandler importHandler)
    {
        _exportHandler = exportHandler;
        _importHandler = importHandler;
    }

    [HttpGet("export")]
    public async Task<ActionResult<ExportDataDto>> Export(CancellationToken cancellationToken)
    {
        var data = await _exportHandler.HandleAsync(new ExportDataQuery(), cancellationToken);
        return Ok(data);
    }

    [HttpPost("import")]
    public async Task<ActionResult<ImportResultDto>> Import(
        [FromBody] ExportDataDto data,
        [FromQuery] bool clearExisting = false,
        CancellationToken cancellationToken = default)
    {
        var result = await _importHandler.HandleAsync(
            new ImportDataCommand(data, clearExisting),
            cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
