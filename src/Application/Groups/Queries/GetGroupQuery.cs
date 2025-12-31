using IdolManagement.Application.Groups.DTOs;
using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Domain.Groups.Repositories;

namespace IdolManagement.Application.Groups.Queries;

public record GetGroupQuery(Guid Id);

public class GetGroupHandler
{
    private readonly IGroupRepository _groupRepository;

    public GetGroupHandler(IGroupRepository groupRepository)
    {
        _groupRepository = groupRepository;
    }

    public async Task<GroupDto?> HandleAsync(GetGroupQuery query, CancellationToken cancellationToken = default)
    {
        var group = await _groupRepository.GetByIdAsync(query.Id, cancellationToken);
        if (group == null)
            return null;

        return GroupMapper.ToDto(group);
    }
}
