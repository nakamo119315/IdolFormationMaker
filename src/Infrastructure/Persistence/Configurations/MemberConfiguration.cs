using IdolManagement.Domain.Members.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IdolManagement.Infrastructure.Persistence.Configurations;

public class MemberConfiguration : IEntityTypeConfiguration<Member>
{
    public void Configure(EntityTypeBuilder<Member> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.BirthDate)
            .IsRequired();

        builder.Property(m => m.Generation)
            .IsRequired(false);

        builder.Property(m => m.IsGraduated)
            .IsRequired()
            .HasDefaultValue(false);

        builder.HasMany(m => m.Images)
            .WithOne()
            .HasForeignKey(i => i.MemberId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(m => m.GroupId);
    }
}

public class MemberImageConfiguration : IEntityTypeConfiguration<MemberImage>
{
    public void Configure(EntityTypeBuilder<MemberImage> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Url)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasIndex(i => i.MemberId);
    }
}
