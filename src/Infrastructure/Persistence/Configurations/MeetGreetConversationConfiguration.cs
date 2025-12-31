using IdolManagement.Domain.Conversations.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IdolManagement.Infrastructure.Persistence.Configurations;

public class MeetGreetConversationConfiguration : IEntityTypeConfiguration<MeetGreetConversation>
{
    public void Configure(EntityTypeBuilder<MeetGreetConversation> builder)
    {
        builder.ToTable("MeetGreetConversations");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Title)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.MemberId);

        builder.Property(c => c.MemberName)
            .HasMaxLength(100);

        builder.Property(c => c.ConversationDate)
            .IsRequired();

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        builder.Property(c => c.UpdatedAt)
            .IsRequired();

        // Configure HasMany relationship with Messages using _messages backing field
        builder.HasMany(c => c.Messages)
            .WithOne()
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Metadata for backing field
        builder.Metadata.FindNavigation(nameof(MeetGreetConversation.Messages))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);

        // Optional foreign key to Members with SET NULL on delete
        builder.HasOne<IdolManagement.Domain.Members.Entities.Member>()
            .WithMany()
            .HasForeignKey(c => c.MemberId)
            .OnDelete(DeleteBehavior.SetNull);

        // Add indexes
        builder.HasIndex(c => c.MemberId);
        builder.HasIndex(c => c.ConversationDate);
    }
}
