using IdolManagement.Application.Setlists.DTOs;
using IdolManagement.Application.Shared.Mappers;
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
        return SetlistMapper.ToDto(updated!);
    }
}
