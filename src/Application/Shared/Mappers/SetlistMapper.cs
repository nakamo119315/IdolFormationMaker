using IdolManagement.Application.Setlists.DTOs;
using IdolManagement.Domain.Setlists.Entities;

namespace IdolManagement.Application.Shared.Mappers;

public static class SetlistMapper
{
    public static SetlistDto ToDto(Setlist setlist) => new(
        setlist.Id,
        setlist.Name,
        setlist.GroupId,
        setlist.EventDate,
        setlist.Items.Select(ToDto).ToList(),
        setlist.CreatedAt,
        setlist.UpdatedAt
    );

    public static SetlistSummaryDto ToSummaryDto(Setlist setlist) => new(
        setlist.Id,
        setlist.Name,
        setlist.GroupId,
        setlist.EventDate,
        setlist.Items.Count,
        setlist.CreatedAt,
        setlist.UpdatedAt
    );

    public static SetlistItemDto ToDto(SetlistItem item) => new(
        item.Id,
        item.SongId,
        item.Order,
        item.CenterMemberId,
        item.Participants.Select(p => p.MemberId).ToList()
    );

    public static IEnumerable<SetlistDto> ToDto(IEnumerable<Setlist> setlists) =>
        setlists.Select(ToDto);

    public static IEnumerable<SetlistSummaryDto> ToSummaryDto(IEnumerable<Setlist> setlists) =>
        setlists.Select(ToSummaryDto);
}
