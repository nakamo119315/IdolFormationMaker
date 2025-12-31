using IdolManagement.Application.Members.DTOs;
using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Domain.Members.Entities;
using IdolManagement.Domain.Members.Repositories;

namespace IdolManagement.Application.Members.Commands;

public record CreateMemberCommand(CreateMemberDto Dto);

public class CreateMemberHandler
{
    private readonly IMemberRepository _memberRepository;

    public CreateMemberHandler(IMemberRepository memberRepository)
    {
        _memberRepository = memberRepository;
    }

    public async Task<MemberDto> HandleAsync(CreateMemberCommand command, CancellationToken cancellationToken = default)
    {
        var member = Member.Create(
            command.Dto.Name,
            command.Dto.BirthDate,
            command.Dto.Birthplace,
            command.Dto.PenLightColor1,
            command.Dto.PenLightColor2,
            command.Dto.GroupId,
            command.Dto.Generation,
            command.Dto.IsGraduated ?? false
        );

        await _memberRepository.AddAsync(member, cancellationToken);

        return MemberMapper.ToDto(member);
    }
}
