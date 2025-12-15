using IdolManagement.Application.Groups.DTOs;
using IdolManagement.Application.Members.DTOs;
using IdolManagement.Domain.Groups.Entities;
using IdolManagement.Domain.Groups.Repositories;

namespace IdolManagement.Application.Groups.Commands;

public record CreateGroupCommand(CreateGroupDto Dto);

public class CreateGroupHandler
{
    private readonly IGroupRepository _groupRepository;

    public CreateGroupHandler(IGroupRepository groupRepository)
    {
        _groupRepository = groupRepository;
    }

    public async Task<GroupDto> HandleAsync(CreateGroupCommand command, CancellationToken cancellationToken = default)
    {
        var group = Group.Create(
            command.Dto.Name,
            command.Dto.DebutDate
        );

        await _groupRepository.AddAsync(group, cancellationToken);

        return ToDto(group);
    }

    private static GroupDto ToDto(Group group) => new(
        group.Id,
        group.Name,
        group.DebutDate,
        group.Members.Select(m => new MemberDto(
            m.Id, m.Name, m.BirthDate, m.GroupId,
            m.Images.Select(i => new MemberImageDto(i.Id, i.Url, i.IsPrimary, i.CreatedAt)),
            m.CreatedAt, m.UpdatedAt)),
        group.CreatedAt,
        group.UpdatedAt
    );
}
