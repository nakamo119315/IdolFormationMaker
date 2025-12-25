using IdolManagement.Domain.Setlists.Entities;
using IdolManagement.Domain.Setlists.Repositories;
using Microsoft.EntityFrameworkCore;

namespace IdolManagement.Infrastructure.Persistence.Repositories;

public class SetlistRepository : ISetlistRepository
{
    private readonly AppDbContext _context;

    public SetlistRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Setlist?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Setlists
            .Include(s => s.Items)
                .ThenInclude(i => i.Participants)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Setlist>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Setlists
            .Include(s => s.Items)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Setlist>> GetByGroupIdAsync(Guid groupId, CancellationToken cancellationToken = default)
    {
        return await _context.Setlists
            .Include(s => s.Items)
            .Where(s => s.GroupId == groupId)
            .OrderByDescending(s => s.EventDate)
            .ThenByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Setlist> AddAsync(Setlist setlist, CancellationToken cancellationToken = default)
    {
        await _context.Setlists.AddAsync(setlist, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return setlist;
    }

    public async Task UpdateAsync(Setlist setlist, CancellationToken cancellationToken = default)
    {
        // Detach tracked items to avoid concurrency issues
        var trackedItems = _context.ChangeTracker.Entries<SetlistItem>()
            .Where(e => e.Entity.SetlistId == setlist.Id)
            .ToList();
        foreach (var entry in trackedItems)
        {
            entry.State = EntityState.Detached;
        }

        var trackedParticipants = _context.ChangeTracker.Entries<SetlistItemParticipant>().ToList();
        foreach (var entry in trackedParticipants)
        {
            entry.State = EntityState.Detached;
        }

        // Delete existing items from database
        var existingItems = await _context.SetlistItems
            .Where(i => i.SetlistId == setlist.Id)
            .Include(i => i.Participants)
            .ToListAsync(cancellationToken);

        foreach (var item in existingItems)
        {
            _context.SetlistItemParticipants.RemoveRange(item.Participants);
        }
        _context.SetlistItems.RemoveRange(existingItems);
        await _context.SaveChangesAsync(cancellationToken);

        // Update setlist and add new items
        var setlistEntry = _context.Entry(setlist);
        setlistEntry.State = EntityState.Modified;

        foreach (var item in setlist.Items)
        {
            _context.SetlistItems.Add(item);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var setlist = await _context.Setlists
            .Include(s => s.Items)
                .ThenInclude(i => i.Participants)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (setlist != null)
        {
            foreach (var item in setlist.Items)
            {
                _context.SetlistItemParticipants.RemoveRange(item.Participants);
            }
            _context.SetlistItems.RemoveRange(setlist.Items);
            _context.Setlists.Remove(setlist);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
