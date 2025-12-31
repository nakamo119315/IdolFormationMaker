using IdolManagement.Domain.Conversations.Entities;
using IdolManagement.Domain.Formations.Entities;
using IdolManagement.Domain.Groups.Entities;
using IdolManagement.Domain.Members.Entities;
using IdolManagement.Domain.Setlists.Entities;
using IdolManagement.Domain.Songs.Entities;
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
    public DbSet<Song> Songs => Set<Song>();
    public DbSet<Setlist> Setlists => Set<Setlist>();
    public DbSet<SetlistItem> SetlistItems => Set<SetlistItem>();
    public DbSet<SetlistItemParticipant> SetlistItemParticipants => Set<SetlistItemParticipant>();
    public DbSet<MeetGreetConversation> MeetGreetConversations => Set<MeetGreetConversation>();
    public DbSet<ConversationMessage> ConversationMessages => Set<ConversationMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
