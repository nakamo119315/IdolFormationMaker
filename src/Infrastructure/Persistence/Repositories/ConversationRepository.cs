using IdolManagement.Domain.Conversations.Entities;
using IdolManagement.Domain.Conversations.Repositories;
using IdolManagement.Domain.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace IdolManagement.Infrastructure.Persistence.Repositories;

public class ConversationRepository : IConversationRepository
{
    private readonly AppDbContext _context;

    public ConversationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<MeetGreetConversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.MeetGreetConversations
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<MeetGreetConversation>> GetAllAsync(Guid? memberId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.MeetGreetConversations
            .Include(c => c.Messages)
            .AsQueryable();

        if (memberId.HasValue)
        {
            query = query.Where(c => c.MemberId == memberId.Value);
        }

        return await query
            .OrderByDescending(c => c.ConversationDate)
            .ThenByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<MeetGreetConversation> AddAsync(MeetGreetConversation conversation, CancellationToken cancellationToken = default)
    {
        await _context.MeetGreetConversations.AddAsync(conversation, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return conversation;
    }

    public async Task UpdateAsync(Guid id, string title, Guid? memberId, DateOnly? conversationDate, IEnumerable<ConversationMessageData> messages, CancellationToken cancellationToken = default)
    {
        Console.WriteLine($"[ConversationRepository.UpdateAsync] Input: id={id}, title={title}, memberId={memberId}, conversationDate={conversationDate}");

        // Fetch existing conversation from DB (tracked by EF)
        var conversation = await _context.MeetGreetConversations
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
            ?? throw new NotFoundException("MeetGreetConversation", id);

        Console.WriteLine($"[ConversationRepository.UpdateAsync] Before update: MemberId={conversation.MemberId}, ConversationDate={conversation.ConversationDate}");

        // Get member name if memberId is provided
        string? memberName = null;
        if (memberId.HasValue)
        {
            var member = await _context.Members.FindAsync(new object[] { memberId.Value }, cancellationToken);
            memberName = member?.Name;
            Console.WriteLine($"[ConversationRepository.UpdateAsync] Found member: {memberName}");
        }

        // Update conversation properties via domain method
        conversation.Update(title, memberId, memberName, conversationDate);
        Console.WriteLine($"[ConversationRepository.UpdateAsync] After update: MemberId={conversation.MemberId}, MemberName={conversation.MemberName}, ConversationDate={conversation.ConversationDate}");

        // Remove existing messages (EF will track deletions)
        _context.ConversationMessages.RemoveRange(conversation.Messages);

        // Add new messages
        foreach (var messageData in messages)
        {
            var newMessage = ConversationMessage.Create(
                id,
                messageData.SpeakerType,
                messageData.Content,
                messageData.Order
            );
            _context.ConversationMessages.Add(newMessage);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var conversation = await _context.MeetGreetConversations
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (conversation != null)
        {
            _context.ConversationMessages.RemoveRange(conversation.Messages);
            _context.MeetGreetConversations.Remove(conversation);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
