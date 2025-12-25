using IdolManagement.Application.Setlists.DTOs;
using IdolManagement.Domain.Setlists.Entities;
using IdolManagement.Domain.Setlists.Repositories;

namespace IdolManagement.Application.Setlists.Queries;

public record GetSetlistQuery(Guid Id);

public class GetSetlistHandler
{
    private readonly ISetlistRepository _setlistRepository;

    public GetSetlistHandler(ISetlistRepository setlistRepository)
    {
        _setlistRepository = setlistRepository;
    }

    public async Task<SetlistDto?> HandleAsync(GetSetlistQuery query, CancellationToken cancellationToken = default)
    {
        var setlist = await _setlistRepository.GetByIdAsync(query.Id, cancellationToken);
        if (setlist == null)
            return null;

        return ToDto(setlist);
    }

    private static SetlistDto ToDto(Setlist setlist) => new(
        setlist.Id,
        setlist.Name,
        setlist.GroupId,
        setlist.EventDate,
        setlist.Items.Select(i => new SetlistItemDto(
            i.Id,
            i.SongId,
            i.Order,
            i.CenterMemberId,
            i.Participants.Select(p => p.MemberId).ToList()
        )).ToList(),
        setlist.CreatedAt,
        setlist.UpdatedAt);
}
