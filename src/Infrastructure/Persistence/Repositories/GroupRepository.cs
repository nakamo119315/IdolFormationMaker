using IdolManagement.Domain.Groups.Entities;
using IdolManagement.Domain.Groups.Repositories;
using Microsoft.EntityFrameworkCore;

namespace IdolManagement.Infrastructure.Persistence.Repositories;

public class GroupRepository : IGroupRepository
{
    private readonly AppDbContext _context;

    public GroupRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Group?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Groups
            .Include(g => g.Members)
                .ThenInclude(m => m.Images)
            .FirstOrDefaultAsync(g => g.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Group>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Groups
            .Include(g => g.Members)
            .ToListAsync(cancellationToken);
    }

    public async Task<Group> AddAsync(Group group, CancellationToken cancellationToken = default)
    {
        await _context.Groups.AddAsync(group, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return group;
    }

    public async Task UpdateAsync(Group group, CancellationToken cancellationToken = default)
    {
        _context.Groups.Update(group);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var group = await _context.Groups.FindAsync(new object[] { id }, cancellationToken);
        if (group != null)
        {
            _context.Groups.Remove(group);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
