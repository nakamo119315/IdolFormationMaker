using IdolManagement.Application.Groups.DTOs;
using IdolManagement.Application.Shared;
using IdolManagement.Application.Shared.Mappers;
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

        var items = GroupMapper.ToSummaryDto(groups);

        return new PagedResult<GroupSummaryDto>(items, totalCount, query.Page, query.PageSize);
    }
}
