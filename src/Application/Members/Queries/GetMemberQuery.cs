using IdolManagement.Application.Members.DTOs;
using IdolManagement.Domain.Members.Entities;
using IdolManagement.Domain.Members.Repositories;

namespace IdolManagement.Application.Members.Queries;

public record GetMemberQuery(Guid Id);

public class GetMemberHandler
{
    private readonly IMemberRepository _memberRepository;

    public GetMemberHandler(IMemberRepository memberRepository)
    {
        _memberRepository = memberRepository;
    }

    public async Task<MemberDto?> HandleAsync(GetMemberQuery query, CancellationToken cancellationToken = default)
    {
        var member = await _memberRepository.GetByIdAsync(query.Id, cancellationToken);
        if (member == null)
            return null;

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
