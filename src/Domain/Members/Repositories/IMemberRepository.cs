using IdolManagement.Domain.Members.Entities;

namespace IdolManagement.Domain.Members.Repositories;

public interface IMemberRepository
{
    Task<Member?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Member>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Member>> GetByGroupIdAsync(Guid groupId, CancellationToken cancellationToken = default);
    Task<Member> AddAsync(Member member, CancellationToken cancellationToken = default);
    Task UpdateAsync(Member member, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddImageAsync(MemberImage image, CancellationToken cancellationToken = default);
    Task DeleteImageAsync(Guid imageId, CancellationToken cancellationToken = default);
}
