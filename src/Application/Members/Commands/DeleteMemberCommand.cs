using IdolManagement.Domain.Members.Repositories;

namespace IdolManagement.Application.Members.Commands;

public record DeleteMemberCommand(Guid Id);

public class DeleteMemberHandler
{
    private readonly IMemberRepository _memberRepository;

    public DeleteMemberHandler(IMemberRepository memberRepository)
    {
        _memberRepository = memberRepository;
    }

    public async Task<bool> HandleAsync(DeleteMemberCommand command, CancellationToken cancellationToken = default)
    {
        var member = await _memberRepository.GetByIdAsync(command.Id, cancellationToken);
        if (member == null)
            return false;

        await _memberRepository.DeleteAsync(command.Id, cancellationToken);
        return true;
    }
}
