using IdolManagement.Application.Formations.DTOs;
using IdolManagement.Domain.Formations.Entities;
using IdolManagement.Domain.Formations.Repositories;

namespace IdolManagement.Application.Formations.Queries;

public record GetFormationQuery(Guid Id);

public class GetFormationHandler
{
    private readonly IFormationRepository _formationRepository;

    public GetFormationHandler(IFormationRepository formationRepository)
    {
        _formationRepository = formationRepository;
    }

    public async Task<FormationDto?> HandleAsync(GetFormationQuery query, CancellationToken cancellationToken = default)
    {
        var formation = await _formationRepository.GetByIdAsync(query.Id, cancellationToken);
        if (formation == null)
            return null;

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
