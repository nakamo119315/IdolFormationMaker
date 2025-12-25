using IdolManagement.Application.Setlists.DTOs;
using IdolManagement.Domain.Setlists.Entities;
using IdolManagement.Domain.Setlists.Repositories;

namespace IdolManagement.Application.Setlists.Commands;

public record UpdateSetlistCommand(Guid Id, UpdateSetlistDto Dto);

public class UpdateSetlistHandler
{
    private readonly ISetlistRepository _setlistRepository;

    public UpdateSetlistHandler(ISetlistRepository setlistRepository)
    {
        _setlistRepository = setlistRepository;
    }

    public async Task<SetlistDto?> HandleAsync(UpdateSetlistCommand command, CancellationToken cancellationToken = default)
    {
        var setlist = await _setlistRepository.GetByIdAsync(command.Id, cancellationToken);
        if (setlist == null)
            return null;

        setlist.Update(command.Dto.Name, command.Dto.EventDate);
        setlist.ClearItems();

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

        await _setlistRepository.UpdateAsync(setlist, cancellationToken);
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
