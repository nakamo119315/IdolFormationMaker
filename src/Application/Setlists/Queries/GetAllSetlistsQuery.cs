using IdolManagement.Application.Setlists.DTOs;
using IdolManagement.Domain.Setlists.Entities;
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
