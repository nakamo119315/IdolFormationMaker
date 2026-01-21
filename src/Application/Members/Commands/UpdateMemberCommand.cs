using IdolManagement.Application.Members.DTOs;
using IdolManagement.Application.Shared.Mappers;
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
            command.Dto.GroupId,
            command.Dto.Generation,
            command.Dto.IsGraduated,
            command.Dto.Nickname,
            command.Dto.CallName
        );

        await _memberRepository.UpdateAsync(member, cancellationToken);

        return MemberMapper.ToDto(member);
    }
}
