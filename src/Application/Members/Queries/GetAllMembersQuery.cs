using IdolManagement.Application.Members.DTOs;
using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Domain.Members.Repositories;

namespace IdolManagement.Application.Members.Queries;

public record GetAllMembersQuery(
    Guid? GroupId = null,
    int? Generation = null,
    bool? IsGraduated = null
);

public class GetAllMembersHandler
{
    private readonly IMemberRepository _memberRepository;

    public GetAllMembersHandler(IMemberRepository memberRepository)
    {
        _memberRepository = memberRepository;
    }

    public async Task<IEnumerable<MemberDto>> HandleAsync(GetAllMembersQuery query, CancellationToken cancellationToken = default)
    {
        var members = await _memberRepository.GetAllAsync(
            query.GroupId,
            query.Generation,
            query.IsGraduated,
            cancellationToken);
        return MemberMapper.ToDto(members);
    }
}
