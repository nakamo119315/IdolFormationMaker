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
        // Fetch existing formation from DB (tracked by EF)
        var existing = await _context.Formations
            .Include(f => f.Positions)
            .FirstOrDefaultAsync(f => f.Id == formation.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Formation with ID {formation.Id} not found.");

        // Update formation properties via domain method
        existing.Update(formation.Name, formation.GroupId);

        // Remove existing positions (EF will track deletions)
        _context.FormationPositions.RemoveRange(existing.Positions);

        // Add new positions
        foreach (var pos in formation.Positions)
        {
            var newPosition = FormationPosition.Create(
                existing.Id,
                pos.MemberId,
                pos.PositionNumber,
                pos.Row,
                pos.Column
            );
            _context.FormationPositions.Add(newPosition);
        }

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
