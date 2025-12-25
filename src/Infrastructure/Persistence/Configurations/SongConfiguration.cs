using IdolManagement.Domain.Songs.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IdolManagement.Infrastructure.Persistence.Configurations;

public class SongConfiguration : IEntityTypeConfiguration<Song>
{
    public void Configure(EntityTypeBuilder<Song> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Lyricist)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Composer)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Arranger)
            .HasMaxLength(100);

        builder.HasIndex(s => s.GroupId);
    }
}
