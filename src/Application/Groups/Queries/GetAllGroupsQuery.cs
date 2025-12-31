using IdolManagement.Application.Groups.DTOs;
using IdolManagement.Application.Shared.Mappers;
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
        return GroupMapper.ToSummaryDto(groups);
    }
}
