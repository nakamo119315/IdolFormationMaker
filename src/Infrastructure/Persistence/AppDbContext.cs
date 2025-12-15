using IdolManagement.Domain.Formations.Entities;
using IdolManagement.Domain.Groups.Entities;
using IdolManagement.Domain.Members.Entities;
using Microsoft.EntityFrameworkCore;

namespace IdolManagement.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Member> Members => Set<Member>();
    public DbSet<MemberImage> MemberImages => Set<MemberImage>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<Formation> Formations => Set<Formation>();
    public DbSet<FormationPosition> FormationPositions => Set<FormationPosition>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
