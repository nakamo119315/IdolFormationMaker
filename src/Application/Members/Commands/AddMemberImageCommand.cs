using IdolManagement.Application.Members.DTOs;
using IdolManagement.Domain.Members.Entities;
using IdolManagement.Domain.Members.Repositories;

namespace IdolManagement.Application.Members.Commands;

public record AddMemberImageCommand(Guid MemberId, AddMemberImageDto Dto);

public class AddMemberImageHandler
{
    private readonly IMemberRepository _memberRepository;

    public AddMemberImageHandler(IMemberRepository memberRepository)
    {
        _memberRepository = memberRepository;
    }

    public async Task<MemberImageDto?> HandleAsync(AddMemberImageCommand command, CancellationToken cancellationToken = default)
    {
        var member = await _memberRepository.GetByIdAsync(command.MemberId, cancellationToken);
        if (member == null)
            return null;

        var image = MemberImage.Create(
            command.MemberId,
            command.Dto.Url,
            command.Dto.IsPrimary
        );

        await _memberRepository.AddImageAsync(image, cancellationToken);

        return new MemberImageDto(image.Id, image.Url, image.IsPrimary, image.CreatedAt);
    }
}
