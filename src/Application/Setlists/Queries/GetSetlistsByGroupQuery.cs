using IdolManagement.Application.Setlists.DTOs;
using IdolManagement.Domain.Setlists.Entities;
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
        return setlists.Select(ToSummaryDto);
    }

    private static SetlistSummaryDto ToSummaryDto(Setlist setlist) => new(
        setlist.Id,
        setlist.Name,
        setlist.GroupId,
        setlist.EventDate,
        setlist.Items.Count,
        setlist.CreatedAt,
        setlist.UpdatedAt);
}
