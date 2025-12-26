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

    public async Task UpdateAsync(Guid id, string name, Guid groupId, IEnumerable<FormationPositionData> positions, CancellationToken cancellationToken = default)
    {
        // Get formation with positions (tracked)
        var formation = await _context.Formations
            .Include(f => f.Positions)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken)
            ?? throw new InvalidOperationException($"Formation with ID {id} not found.");

        // Update formation properties
        formation.Update(name, groupId);

        // Remove existing positions through EF tracking
        _context.FormationPositions.RemoveRange(formation.Positions);

        // Add new positions
        foreach (var pos in positions)
        {
            var newPosition = FormationPosition.Create(
                id,
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
