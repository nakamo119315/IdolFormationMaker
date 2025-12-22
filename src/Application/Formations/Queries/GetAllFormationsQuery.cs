using IdolManagement.Application.Formations.DTOs;
using IdolManagement.Domain.Formations.Entities;
using IdolManagement.Domain.Formations.Repositories;

namespace IdolManagement.Application.Formations.Queries;

public record GetAllFormationsQuery;

public class GetAllFormationsHandler
{
    private readonly IFormationRepository _formationRepository;

    public GetAllFormationsHandler(IFormationRepository formationRepository)
    {
        _formationRepository = formationRepository;
    }

    public async Task<IEnumerable<FormationDto>> HandleAsync(GetAllFormationsQuery query, CancellationToken cancellationToken = default)
    {
        var formations = await _formationRepository.GetAllAsync(cancellationToken);
        return formations.Select(ToDto);
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
