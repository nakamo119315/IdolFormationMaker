using IdolManagement.Domain.Formations.Entities;

namespace IdolManagement.Domain.Formations.Repositories;

public interface IFormationRepository
{
    Task<Formation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Formation>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Formation>> GetByGroupIdAsync(Guid groupId, CancellationToken cancellationToken = default);
    Task<Formation> AddAsync(Formation formation, CancellationToken cancellationToken = default);
    Task UpdateAsync(Formation formation, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
