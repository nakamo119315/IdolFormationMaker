using IdolManagement.Domain.Conversations.Entities;

namespace IdolManagement.Domain.Conversations.Repositories;

public record ConversationMessageData(SpeakerType SpeakerType, string Content, int Order);

public interface IConversationRepository
{
    Task<MeetGreetConversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<MeetGreetConversation>> GetAllAsync(Guid? memberId = null, CancellationToken cancellationToken = default);
    Task<MeetGreetConversation> AddAsync(MeetGreetConversation conversation, CancellationToken cancellationToken = default);
    Task UpdateAsync(Guid id, string title, Guid? memberId, DateOnly? conversationDate, IEnumerable<ConversationMessageData> messages, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
