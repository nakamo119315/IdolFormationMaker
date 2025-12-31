using IdolManagement.Application.Formations.DTOs;
using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Domain.Formations.Repositories;

namespace IdolManagement.Application.Formations.Commands;

public record UpdateFormationCommand(Guid Id, UpdateFormationDto Dto);

public class UpdateFormationHandler
{
    private readonly IFormationRepository _formationRepository;

    public UpdateFormationHandler(IFormationRepository formationRepository)
    {
        _formationRepository = formationRepository;
    }

    public async Task<FormationDto?> HandleAsync(UpdateFormationCommand command, CancellationToken cancellationToken = default)
    {
        // Check if formation exists
        var existing = await _formationRepository.GetByIdAsync(command.Id, cancellationToken);
        if (existing == null)
            return null;

        // Convert DTOs to repository data
        var positions = command.Dto.Positions
            .Select(p => new FormationPositionData(
                p.MemberId,
                p.PositionNumber,
                p.Row,
                p.Column
            ));

        // Update via repository
        await _formationRepository.UpdateAsync(
            command.Id,
            command.Dto.Name,
            command.Dto.GroupId,
            positions,
            cancellationToken);

        // Reload to get updated data
        var updated = await _formationRepository.GetByIdAsync(command.Id, cancellationToken);
        return FormationMapper.ToDto(updated!);
    }
}
