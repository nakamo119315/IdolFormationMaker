using IdolManagement.Application.Groups.DTOs;
using IdolManagement.Application.Members.DTOs;
using IdolManagement.Domain.Groups.Entities;
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

        return ToDto(group);
    }

    private static GroupDto ToDto(Group group) => new(
        group.Id,
        group.Name,
        group.DebutDate,
        group.Members.Select(m => new MemberDto(
            m.Id, m.Name, m.BirthDate, m.Birthplace, m.PenLightColor1, m.PenLightColor2, m.GroupId,
            m.Images.Select(i => new MemberImageDto(i.Id, i.Url, i.IsPrimary, i.CreatedAt)),
            m.CreatedAt, m.UpdatedAt)),
        group.CreatedAt,
        group.UpdatedAt
    );
}
