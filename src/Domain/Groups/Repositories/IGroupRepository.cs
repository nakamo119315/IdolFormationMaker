using IdolManagement.Domain.Groups.Entities;

namespace IdolManagement.Domain.Groups.Repositories;

public interface IGroupRepository
{
    Task<Group?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Group>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Group> AddAsync(Group group, CancellationToken cancellationToken = default);
    Task UpdateAsync(Group group, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
