namespace IdolManagement.Application.Formations.DTOs;

public record FormationDto(
    Guid Id,
    string Name,
    Guid GroupId,
    IEnumerable<FormationPositionDto> Positions,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record FormationPositionDto(
    Guid Id,
    Guid MemberId,
    int PositionNumber,
    int Row,
    int Column
);

public record CreateFormationDto(
    string Name,
    Guid GroupId,
    IEnumerable<CreateFormationPositionDto> Positions
);

public record CreateFormationPositionDto(
    Guid MemberId,
    int PositionNumber,
    int Row,
    int Column
);

public record UpdateFormationDto(
    string Name,
    Guid GroupId,
    IEnumerable<CreateFormationPositionDto> Positions
);
