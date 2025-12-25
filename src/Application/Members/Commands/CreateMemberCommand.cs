using IdolManagement.Application.Members.DTOs;
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
        member.Generation,
        member.IsGraduated,
        member.Images.Select(i => new MemberImageDto(i.Id, i.Url, i.IsPrimary, i.CreatedAt)),
        member.CreatedAt,
        member.UpdatedAt
    );
}
