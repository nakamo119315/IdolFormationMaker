using IdolManagement.Domain.Setlists.Entities;

namespace IdolManagement.Domain.Setlists.Repositories;

public interface ISetlistRepository
{
    Task<Setlist?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Setlist>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Setlist>> GetByGroupIdAsync(Guid groupId, CancellationToken cancellationToken = default);
    Task<Setlist> AddAsync(Setlist setlist, CancellationToken cancellationToken = default);
    Task UpdateAsync(Setlist setlist, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
