using IdolManagement.Domain.Groups.Repositories;

namespace IdolManagement.Application.Groups.Commands;

public record DeleteGroupCommand(Guid Id);

public class DeleteGroupHandler
{
    private readonly IGroupRepository _groupRepository;

    public DeleteGroupHandler(IGroupRepository groupRepository)
    {
        _groupRepository = groupRepository;
    }

    public async Task<bool> HandleAsync(DeleteGroupCommand command, CancellationToken cancellationToken = default)
    {
        var group = await _groupRepository.GetByIdAsync(command.Id, cancellationToken);
        if (group == null)
            return false;

        await _groupRepository.DeleteAsync(command.Id, cancellationToken);
        return true;
    }
}
