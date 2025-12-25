namespace IdolManagement.Application.Setlists.DTOs;

public record SetlistDto(
    Guid Id,
    string Name,
    Guid GroupId,
    DateOnly? EventDate,
    List<SetlistItemDto> Items,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record SetlistSummaryDto(
    Guid Id,
    string Name,
    Guid GroupId,
    DateOnly? EventDate,
    int ItemCount,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record SetlistItemDto(
    Guid Id,
    Guid SongId,
    int Order,
    Guid? CenterMemberId,
    List<Guid> ParticipantMemberIds);

public record CreateSetlistDto(
    string Name,
    Guid GroupId,
    DateOnly? EventDate,
    List<CreateSetlistItemDto> Items);

public record CreateSetlistItemDto(
    Guid SongId,
    int Order,
    Guid? CenterMemberId,
    List<Guid>? ParticipantMemberIds);

public record UpdateSetlistDto(
    string Name,
    DateOnly? EventDate,
    List<CreateSetlistItemDto> Items);
