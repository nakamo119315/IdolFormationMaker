using IdolManagement.Application.Members.DTOs;
using IdolManagement.Application.Shared.Mappers;
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

        return MemberMapper.ToDto(member);
    }
}
