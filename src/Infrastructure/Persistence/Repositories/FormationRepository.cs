using IdolManagement.Domain.Formations.Entities;
using IdolManagement.Domain.Formations.Repositories;
using Microsoft.EntityFrameworkCore;

namespace IdolManagement.Infrastructure.Persistence.Repositories;

public class FormationRepository : IFormationRepository
{
    private readonly AppDbContext _context;

    public FormationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Formation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Formations
            .Include(f => f.Positions)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Formation>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Formations
            .Include(f => f.Positions)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Formation>> GetByGroupIdAsync(Guid groupId, CancellationToken cancellationToken = default)
    {
        return await _context.Formations
            .Include(f => f.Positions)
            .Where(f => f.GroupId == groupId)
            .ToListAsync(cancellationToken);
    }

    public async Task<Formation> AddAsync(Formation formation, CancellationToken cancellationToken = default)
    {
        await _context.Formations.AddAsync(formation, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return formation;
    }

    public async Task UpdateAsync(Formation formation, CancellationToken cancellationToken = default)
    {
        // Delete existing positions directly from DB
        await _context.FormationPositions
            .Where(p => p.FormationId == formation.Id)
            .ExecuteDeleteAsync(cancellationToken);

        // Detach any tracked position entities to avoid conflicts
        var trackedPositions = _context.ChangeTracker.Entries<FormationPosition>()
            .Where(e => e.Entity.FormationId == formation.Id)
            .ToList();
        foreach (var entry in trackedPositions)
        {
            entry.State = EntityState.Detached;
        }

        // Add new positions
        foreach (var position in formation.Positions)
        {
            _context.FormationPositions.Add(position);
        }

        // Update formation properties only
        _context.Entry(formation).State = EntityState.Modified;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var formation = await _context.Formations.FindAsync(new object[] { id }, cancellationToken);
        if (formation != null)
        {
            _context.Formations.Remove(formation);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
