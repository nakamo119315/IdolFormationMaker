using IdolManagement.Domain.Groups.Repositories;

namespace IdolManagement.Application.Groups.Commands;

public record DeleteGroupsBulkCommand(IEnumerable<Guid> Ids);

public class DeleteGroupsBulkHandler(IGroupRepository groupRepository)
{
    public async Task<int> HandleAsync(DeleteGroupsBulkCommand command, CancellationToken ct = default)
    {
        var deletedCount = 0;
        foreach (var id in command.Ids)
        {
            var group = await groupRepository.GetByIdAsync(id, ct);
            if (group != null)
            {
                await groupRepository.DeleteAsync(id, ct);
                deletedCount++;
            }
        }
        return deletedCount;
    }
}
