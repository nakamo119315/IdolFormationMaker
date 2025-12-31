using IdolManagement.Application.Groups.DTOs;
using IdolManagement.Application.Shared.Mappers;
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
            command.Dto.DebutDate,
            command.Dto.HasGeneration ?? false
        );

        await _groupRepository.AddAsync(group, cancellationToken);

        return GroupMapper.ToDto(group);
    }
}
