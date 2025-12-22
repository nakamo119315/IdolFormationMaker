namespace IdolManagement.Application.Members.DTOs;

public record MemberDto(
    Guid Id,
    string Name,
    DateOnly BirthDate,
    string? Birthplace,
    string? PenLightColor1,
    string? PenLightColor2,
    Guid? GroupId,
    IEnumerable<MemberImageDto> Images,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record MemberImageDto(
    Guid Id,
    string Url,
    bool IsPrimary,
    DateTime CreatedAt
);

public record CreateMemberDto(
    string Name,
    DateOnly BirthDate,
    string? Birthplace,
    string? PenLightColor1,
    string? PenLightColor2,
    Guid? GroupId
);

public record UpdateMemberDto(
    string Name,
    DateOnly BirthDate,
    string? Birthplace,
    string? PenLightColor1,
    string? PenLightColor2,
    Guid? GroupId
);

public record AddMemberImageDto(
    string Url,
    bool IsPrimary
);
