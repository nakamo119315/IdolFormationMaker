using IdolManagement.Domain.Formations.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IdolManagement.Infrastructure.Persistence.Configurations;

public class FormationConfiguration : IEntityTypeConfiguration<Formation>
{
    public void Configure(EntityTypeBuilder<Formation> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasMany(f => f.Positions)
            .WithOne()
            .HasForeignKey(p => p.FormationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(f => f.GroupId);
    }
}

public class FormationPositionConfiguration : IEntityTypeConfiguration<FormationPosition>
{
    public void Configure(EntityTypeBuilder<FormationPosition> builder)
    {
        builder.HasKey(p => p.Id);

        builder.HasIndex(p => p.FormationId);
        builder.HasIndex(p => p.MemberId);
    }
}
