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
        // Check if setlist exists
        var existing = await _setlistRepository.GetByIdAsync(command.Id, cancellationToken);
        if (existing == null)
            return null;

        // Convert DTOs to repository data
        var items = command.Dto.Items
            .OrderBy(i => i.Order)
            .Select(i => new SetlistItemData(
                i.SongId,
                i.Order,
                i.CenterMemberId,
                i.ParticipantMemberIds ?? Enumerable.Empty<Guid>()
            ));

        // Update via repository
        await _setlistRepository.UpdateAsync(
            command.Id,
            command.Dto.Name,
            command.Dto.EventDate,
            items,
            cancellationToken);

        // Reload to get updated data
        var updated = await _setlistRepository.GetByIdAsync(command.Id, cancellationToken);
        return ToDto(updated!);
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
