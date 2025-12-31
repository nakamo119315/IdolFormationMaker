using IdolManagement.Application.Groups.DTOs;
using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Domain.Groups.Repositories;

namespace IdolManagement.Application.Groups.Commands;

public record UpdateGroupCommand(Guid Id, UpdateGroupDto Dto);

public class UpdateGroupHandler
{
    private readonly IGroupRepository _groupRepository;

    public UpdateGroupHandler(IGroupRepository groupRepository)
    {
        _groupRepository = groupRepository;
    }

    public async Task<GroupDto?> HandleAsync(UpdateGroupCommand command, CancellationToken cancellationToken = default)
    {
        var group = await _groupRepository.GetByIdAsync(command.Id, cancellationToken);
        if (group == null)
            return null;

        group.Update(
            command.Dto.Name,
            command.Dto.DebutDate,
            command.Dto.HasGeneration
        );

        await _groupRepository.UpdateAsync(group, cancellationToken);

        return GroupMapper.ToDto(group);
    }
}
