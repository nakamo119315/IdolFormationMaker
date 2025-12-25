using IdolManagement.Application.Groups.DTOs;
using IdolManagement.Domain.Groups.Entities;
using IdolManagement.Domain.Groups.Repositories;

namespace IdolManagement.Application.Groups.Queries;

public record GetAllGroupsQuery;

public class GetAllGroupsHandler
{
    private readonly IGroupRepository _groupRepository;

    public GetAllGroupsHandler(IGroupRepository groupRepository)
    {
        _groupRepository = groupRepository;
    }

    public async Task<IEnumerable<GroupSummaryDto>> HandleAsync(GetAllGroupsQuery query, CancellationToken cancellationToken = default)
    {
        var groups = await _groupRepository.GetAllAsync(cancellationToken);
        return groups.Select(ToSummaryDto);
    }

    private static GroupSummaryDto ToSummaryDto(Group group) => new(
        group.Id,
        group.Name,
        group.DebutDate,
        group.HasGeneration,
        group.Members.Count,
        group.CreatedAt,
        group.UpdatedAt
    );
}
