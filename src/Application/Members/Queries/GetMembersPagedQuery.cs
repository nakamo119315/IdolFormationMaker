using IdolManagement.Application.Members.DTOs;
using IdolManagement.Application.Shared;
using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Domain.Members.Repositories;

namespace IdolManagement.Application.Members.Queries;

public record GetMembersPagedQuery(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    Guid? GroupId = null,
    int? Generation = null,
    bool? IsGraduated = null
);

public class GetMembersPagedHandler
{
    private readonly IMemberRepository _memberRepository;

    public GetMembersPagedHandler(IMemberRepository memberRepository)
    {
        _memberRepository = memberRepository;
    }

    public async Task<PagedResult<MemberDto>> HandleAsync(GetMembersPagedQuery query, CancellationToken cancellationToken = default)
    {
        var (members, totalCount) = await _memberRepository.GetPagedAsync(
            query.Page,
            query.PageSize,
            query.Search,
            query.GroupId,
            query.Generation,
            query.IsGraduated,
            cancellationToken);

        var items = MemberMapper.ToDto(members);

        return new PagedResult<MemberDto>(items, totalCount, query.Page, query.PageSize);
    }
}
