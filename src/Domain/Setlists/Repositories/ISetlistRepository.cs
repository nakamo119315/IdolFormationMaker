using IdolManagement.Domain.Setlists.Entities;

namespace IdolManagement.Domain.Setlists.Repositories;

public record SetlistItemData(Guid SongId, int Order, Guid? CenterMemberId, IEnumerable<Guid> ParticipantMemberIds);

public interface ISetlistRepository
{
    Task<Setlist?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Setlist>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Setlist>> GetByGroupIdAsync(Guid groupId, CancellationToken cancellationToken = default);
    Task<Setlist> AddAsync(Setlist setlist, CancellationToken cancellationToken = default);
    Task UpdateAsync(Guid id, string name, DateOnly? eventDate, IEnumerable<SetlistItemData> items, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
