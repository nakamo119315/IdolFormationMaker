using IdolManagement.Application.Members.DTOs;
using IdolManagement.Domain.Members.Entities;
using IdolManagement.Domain.Members.Repositories;

namespace IdolManagement.Application.Members.Queries;

public record GetAllMembersQuery;

public class GetAllMembersHandler
{
    private readonly IMemberRepository _memberRepository;

    public GetAllMembersHandler(IMemberRepository memberRepository)
    {
        _memberRepository = memberRepository;
    }

    public async Task<IEnumerable<MemberDto>> HandleAsync(GetAllMembersQuery query, CancellationToken cancellationToken = default)
    {
        var members = await _memberRepository.GetAllAsync(cancellationToken);
        return members.Select(ToDto);
    }

    private static MemberDto ToDto(Member member) => new(
        member.Id,
        member.Name,
        member.BirthDate,
        member.GroupId,
        member.Images.Select(i => new MemberImageDto(i.Id, i.Url, i.IsPrimary, i.CreatedAt)),
        member.CreatedAt,
        member.UpdatedAt
    );
}
