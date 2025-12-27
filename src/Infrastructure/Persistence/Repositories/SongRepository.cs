using IdolManagement.Domain.Songs.Entities;
using IdolManagement.Domain.Songs.Repositories;
using Microsoft.EntityFrameworkCore;

namespace IdolManagement.Infrastructure.Persistence.Repositories;

public class SongRepository : ISongRepository
{
    private readonly AppDbContext _context;

    public SongRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Song?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Songs
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Song>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Songs
            .OrderBy(s => s.Title)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Song>> GetByGroupIdAsync(Guid groupId, CancellationToken cancellationToken = default)
    {
        return await _context.Songs
            .Where(s => s.GroupId == groupId)
            .OrderBy(s => s.Title)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<Song> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        Guid? groupId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Songs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(s => s.Title.Contains(search) ||
                                     s.Lyricist.Contains(search) ||
                                     s.Composer.Contains(search));
        }

        if (groupId.HasValue)
        {
            query = query.Where(s => s.GroupId == groupId.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(s => s.Title)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Song> AddAsync(Song song, CancellationToken cancellationToken = default)
    {
        await _context.Songs.AddAsync(song, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return song;
    }

    public async Task UpdateAsync(Song song, CancellationToken cancellationToken = default)
    {
        _context.Songs.Update(song);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var song = await _context.Songs.FindAsync(new object[] { id }, cancellationToken);
        if (song != null)
        {
            _context.Songs.Remove(song);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
