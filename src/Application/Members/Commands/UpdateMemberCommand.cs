using IdolManagement.Application.Members.DTOs;
using IdolManagement.Domain.Members.Entities;
using IdolManagement.Domain.Members.Repositories;

namespace IdolManagement.Application.Members.Commands;

public record UpdateMemberCommand(Guid Id, UpdateMemberDto Dto);

public class UpdateMemberHandler
{
    private readonly IMemberRepository _memberRepository;

    public UpdateMemberHandler(IMemberRepository memberRepository)
    {
        _memberRepository = memberRepository;
    }

    public async Task<MemberDto?> HandleAsync(UpdateMemberCommand command, CancellationToken cancellationToken = default)
    {
        var member = await _memberRepository.GetByIdAsync(command.Id, cancellationToken);
        if (member == null)
            return null;

        member.Update(
            command.Dto.Name,
            command.Dto.BirthDate,
            command.Dto.Birthplace,
            command.Dto.PenLightColor1,
            command.Dto.PenLightColor2,
            command.Dto.GroupId
        );

        await _memberRepository.UpdateAsync(member, cancellationToken);

        return ToDto(member);
    }

    private static MemberDto ToDto(Member member) => new(
        member.Id,
        member.Name,
        member.BirthDate,
        member.Birthplace,
        member.PenLightColor1,
        member.PenLightColor2,
        member.GroupId,
        member.Images.Select(i => new MemberImageDto(i.Id, i.Url, i.IsPrimary, i.CreatedAt)),
        member.CreatedAt,
        member.UpdatedAt
    );
}
