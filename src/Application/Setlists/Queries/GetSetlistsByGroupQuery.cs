using IdolManagement.Application.Setlists.DTOs;
using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Domain.Setlists.Repositories;

namespace IdolManagement.Application.Setlists.Queries;

public record GetSetlistsByGroupQuery(Guid GroupId);

public class GetSetlistsByGroupHandler
{
    private readonly ISetlistRepository _setlistRepository;

    public GetSetlistsByGroupHandler(ISetlistRepository setlistRepository)
    {
        _setlistRepository = setlistRepository;
    }

    public async Task<IEnumerable<SetlistSummaryDto>> HandleAsync(GetSetlistsByGroupQuery query, CancellationToken cancellationToken = default)
    {
        var setlists = await _setlistRepository.GetByGroupIdAsync(query.GroupId, cancellationToken);
        return SetlistMapper.ToSummaryDto(setlists);
    }
}
