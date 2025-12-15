using IdolManagement.Domain.Members.Repositories;

namespace IdolManagement.Application.Members.Commands;

public record DeleteMemberImageCommand(Guid MemberId, Guid ImageId);

public class DeleteMemberImageHandler
{
    private readonly IMemberRepository _memberRepository;

    public DeleteMemberImageHandler(IMemberRepository memberRepository)
    {
        _memberRepository = memberRepository;
    }

    public async Task<bool> HandleAsync(DeleteMemberImageCommand command, CancellationToken cancellationToken = default)
    {
        var member = await _memberRepository.GetByIdAsync(command.MemberId, cancellationToken);
        if (member == null)
            return false;

        var image = member.Images.FirstOrDefault(i => i.Id == command.ImageId);
        if (image == null)
            return false;

        await _memberRepository.DeleteImageAsync(command.ImageId, cancellationToken);
        return true;
    }
}
