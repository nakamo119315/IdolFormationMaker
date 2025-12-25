using IdolManagement.Domain.Songs.Entities;

namespace IdolManagement.Domain.Songs.Repositories;

public interface ISongRepository
{
    Task<Song?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Song>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Song>> GetByGroupIdAsync(Guid groupId, CancellationToken cancellationToken = default);
    Task<Song> AddAsync(Song song, CancellationToken cancellationToken = default);
    Task UpdateAsync(Song song, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
