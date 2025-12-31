using IdolManagement.Domain.Setlists.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IdolManagement.Infrastructure.Persistence.Configurations;

public class SetlistConfiguration : IEntityTypeConfiguration<Setlist>
{
    public void Configure(EntityTypeBuilder<Setlist> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasMany(s => s.Items)
            .WithOne()
            .HasForeignKey(i => i.SetlistId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(s => s.Items)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(s => s.GroupId);
    }
}

public class SetlistItemConfiguration : IEntityTypeConfiguration<SetlistItem>
{
    public void Configure(EntityTypeBuilder<SetlistItem> builder)
    {
        builder.HasKey(i => i.Id);

        builder.HasMany(i => i.Participants)
            .WithOne()
            .HasForeignKey(p => p.SetlistItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(i => i.Participants)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(i => i.SetlistId);
        builder.HasIndex(i => i.SongId);
    }
}

public class SetlistItemParticipantConfiguration : IEntityTypeConfiguration<SetlistItemParticipant>
{
    public void Configure(EntityTypeBuilder<SetlistItemParticipant> builder)
    {
        builder.HasKey(p => p.Id);

        builder.HasIndex(p => p.SetlistItemId);
        builder.HasIndex(p => p.MemberId);
    }
}
