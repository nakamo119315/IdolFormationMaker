using IdolManagement.Application.Formations.DTOs;
using IdolManagement.Application.Shared.Mappers;
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
        return FormationMapper.ToDto(formations);
    }
}
