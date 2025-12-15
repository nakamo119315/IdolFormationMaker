using IdolManagement.Application.Members.DTOs;

namespace IdolManagement.Application.Groups.DTOs;

public record GroupDto(
    Guid Id,
    string Name,
    DateOnly? DebutDate,
    IEnumerable<MemberDto> Members,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record GroupSummaryDto(
    Guid Id,
    string Name,
    DateOnly? DebutDate,
    int MemberCount,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateGroupDto(
    string Name,
    DateOnly? DebutDate
);

public record UpdateGroupDto(
    string Name,
    DateOnly? DebutDate
);
