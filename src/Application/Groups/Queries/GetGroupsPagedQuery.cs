using IdolManagement.Application.Groups.DTOs;
using IdolManagement.Application.Shared;
using IdolManagement.Domain.Groups.Entities;
using IdolManagement.Domain.Groups.Repositories;

namespace IdolManagement.Application.Groups.Queries;

public record GetGroupsPagedQuery(
    int Page = 1,
    int PageSize = 20,
    string? Search = null
);

public class GetGroupsPagedHandler
{
    private readonly IGroupRepository _groupRepository;

    public GetGroupsPagedHandler(IGroupRepository groupRepository)
    {
        _groupRepository = groupRepository;
    }

    public async Task<PagedResult<GroupSummaryDto>> HandleAsync(GetGroupsPagedQuery query, CancellationToken cancellationToken = default)
    {
        var (groups, totalCount) = await _groupRepository.GetPagedAsync(
            query.Page,
            query.PageSize,
            query.Search,
            cancellationToken);

        var items = groups.Select(ToDto);

        return new PagedResult<GroupSummaryDto>(items, totalCount, query.Page, query.PageSize);
    }

    private static GroupSummaryDto ToDto(Group group) => new(
        group.Id,
        group.Name,
        group.DebutDate,
        group.HasGeneration,
        group.Members.Count,
        group.CreatedAt,
        group.UpdatedAt
    );
}
