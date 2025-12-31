using IdolManagement.Application.Groups.DTOs;
using IdolManagement.Domain.Groups.Entities;

namespace IdolManagement.Application.Shared.Mappers;

public static class GroupMapper
{
    public static GroupDto ToDto(Group group) => new(
        group.Id,
        group.Name,
        group.DebutDate,
        group.HasGeneration,
        group.Members.Select(MemberMapper.ToDto),
        group.CreatedAt,
        group.UpdatedAt
    );

    public static GroupSummaryDto ToSummaryDto(Group group) => new(
        group.Id,
        group.Name,
        group.DebutDate,
        group.HasGeneration,
        group.Members.Count,
        group.CreatedAt,
        group.UpdatedAt
    );

    public static IEnumerable<GroupDto> ToDto(IEnumerable<Group> groups) =>
        groups.Select(ToDto);

    public static IEnumerable<GroupSummaryDto> ToSummaryDto(IEnumerable<Group> groups) =>
        groups.Select(ToSummaryDto);
}
