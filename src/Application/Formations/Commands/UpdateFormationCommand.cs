using IdolManagement.Application.Formations.DTOs;
using IdolManagement.Domain.Formations.Entities;
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
        var formation = await _formationRepository.GetByIdAsync(command.Id, cancellationToken);
        if (formation == null)
            return null;

        formation.Update(
            command.Dto.Name,
            command.Dto.GroupId
        );

        formation.ClearPositions();
        foreach (var posDto in command.Dto.Positions)
        {
            var position = FormationPosition.Create(
                formation.Id,
                posDto.MemberId,
                posDto.PositionNumber,
                posDto.Row,
                posDto.Column
            );
            formation.AddPosition(position);
        }

        await _formationRepository.UpdateAsync(formation, cancellationToken);

        return ToDto(formation);
    }

    private static FormationDto ToDto(Formation formation) => new(
        formation.Id,
        formation.Name,
        formation.GroupId,
        formation.Positions
            .OrderBy(p => p.PositionNumber)
            .Select(p => new FormationPositionDto(
                p.Id, p.MemberId, p.PositionNumber, p.Row, p.Column)),
        formation.CreatedAt,
        formation.UpdatedAt
    );
}
