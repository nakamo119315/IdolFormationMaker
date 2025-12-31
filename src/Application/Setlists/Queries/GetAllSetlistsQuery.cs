using IdolManagement.Application.Setlists.DTOs;
using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Domain.Setlists.Repositories;

namespace IdolManagement.Application.Setlists.Queries;

public record GetAllSetlistsQuery;

public class GetAllSetlistsHandler
{
    private readonly ISetlistRepository _setlistRepository;

    public GetAllSetlistsHandler(ISetlistRepository setlistRepository)
    {
        _setlistRepository = setlistRepository;
    }

    public async Task<IEnumerable<SetlistSummaryDto>> HandleAsync(GetAllSetlistsQuery query, CancellationToken cancellationToken = default)
    {
        var setlists = await _setlistRepository.GetAllAsync(cancellationToken);
        return SetlistMapper.ToSummaryDto(setlists);
    }
}
