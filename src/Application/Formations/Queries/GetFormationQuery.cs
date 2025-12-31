using IdolManagement.Application.Formations.DTOs;
using IdolManagement.Application.Shared.Mappers;
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

        return FormationMapper.ToDto(formation);
    }
}
