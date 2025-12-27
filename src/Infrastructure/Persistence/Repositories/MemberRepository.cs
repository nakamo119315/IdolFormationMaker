using IdolManagement.Domain.Members.Entities;
using IdolManagement.Domain.Members.Repositories;
using Microsoft.EntityFrameworkCore;

namespace IdolManagement.Infrastructure.Persistence.Repositories;

public class MemberRepository : IMemberRepository
{
    private readonly AppDbContext _context;

    public MemberRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Member?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Members
            .Include(m => m.Images)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Member>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Members
            .Include(m => m.Images)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Member>> GetByGroupIdAsync(Guid groupId, CancellationToken cancellationToken = default)
    {
        return await _context.Members
            .Include(m => m.Images)
            .Where(m => m.GroupId == groupId)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<Member> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        Guid? groupId = null,
        int? generation = null,
        bool? isGraduated = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Members
            .Include(m => m.Images)
            .AsQueryable();

        // 検索フィルタ
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(m => m.Name.Contains(search) ||
                                     (m.Birthplace != null && m.Birthplace.Contains(search)));
        }

        // グループフィルタ
        if (groupId.HasValue)
        {
            query = query.Where(m => m.GroupId == groupId.Value);
        }

        // 期フィルタ
        if (generation.HasValue)
        {
            query = query.Where(m => m.Generation == generation.Value);
        }

        // 卒業フラグフィルタ
        if (isGraduated.HasValue)
        {
            query = query.Where(m => m.IsGraduated == isGraduated.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(m => m.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Member> AddAsync(Member member, CancellationToken cancellationToken = default)
    {
        await _context.Members.AddAsync(member, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return member;
    }

    public async Task UpdateAsync(Member member, CancellationToken cancellationToken = default)
    {
        _context.Members.Update(member);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var member = await _context.Members.FindAsync(new object[] { id }, cancellationToken);
        if (member != null)
        {
            _context.Members.Remove(member);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task AddImageAsync(MemberImage image, CancellationToken cancellationToken = default)
    {
        await _context.MemberImages.AddAsync(image, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteImageAsync(Guid imageId, CancellationToken cancellationToken = default)
    {
        var image = await _context.MemberImages.FindAsync(new object[] { imageId }, cancellationToken);
        if (image != null)
        {
            _context.MemberImages.Remove(image);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
