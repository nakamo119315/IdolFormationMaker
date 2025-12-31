using IdolManagement.Application.Formations.DTOs;
using IdolManagement.Domain.Formations.Entities;

namespace IdolManagement.Application.Shared.Mappers;

public static class FormationMapper
{
    public static FormationDto ToDto(Formation formation) => new(
        formation.Id,
        formation.Name,
        formation.GroupId,
        formation.Positions.OrderBy(p => p.PositionNumber).Select(ToDto),
        formation.CreatedAt,
        formation.UpdatedAt
    );

    public static FormationPositionDto ToDto(FormationPosition position) => new(
        position.Id,
        position.MemberId,
        position.PositionNumber,
        position.Row,
        position.Column
    );

    public static IEnumerable<FormationDto> ToDto(IEnumerable<Formation> formations) =>
        formations.Select(ToDto);
}
