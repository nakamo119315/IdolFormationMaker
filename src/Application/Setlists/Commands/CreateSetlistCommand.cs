using IdolManagement.Application.Setlists.DTOs;
using IdolManagement.Domain.Setlists.Entities;
using IdolManagement.Domain.Setlists.Repositories;

namespace IdolManagement.Application.Setlists.Commands;

public record CreateSetlistCommand(CreateSetlistDto Dto);

public class CreateSetlistHandler
{
    private readonly ISetlistRepository _setlistRepository;

    public CreateSetlistHandler(ISetlistRepository setlistRepository)
    {
        _setlistRepository = setlistRepository;
    }

    public async Task<SetlistDto> HandleAsync(CreateSetlistCommand command, CancellationToken cancellationToken = default)
    {
        var setlist = Setlist.Create(
            command.Dto.Name,
            command.Dto.GroupId,
            command.Dto.EventDate);

        foreach (var itemDto in command.Dto.Items.OrderBy(i => i.Order))
        {
            var item = setlist.AddItem(itemDto.SongId, itemDto.Order, itemDto.CenterMemberId);
            if (itemDto.ParticipantMemberIds != null)
            {
                foreach (var memberId in itemDto.ParticipantMemberIds)
                {
                    item.AddParticipant(memberId);
                }
            }
        }

        await _setlistRepository.AddAsync(setlist, cancellationToken);
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
