using IdolManagement.Domain.Members.Repositories;

namespace IdolManagement.Application.Members.Commands;

public record DeleteMembersBulkCommand(IEnumerable<Guid> Ids);

public class DeleteMembersBulkHandler(IMemberRepository memberRepository)
{
    public async Task<int> HandleAsync(DeleteMembersBulkCommand command, CancellationToken ct = default)
    {
        var deletedCount = 0;
        foreach (var id in command.Ids)
        {
            var member = await memberRepository.GetByIdAsync(id, ct);
            if (member != null)
            {
                await memberRepository.DeleteAsync(id, ct);
                deletedCount++;
            }
        }
        return deletedCount;
    }
}
