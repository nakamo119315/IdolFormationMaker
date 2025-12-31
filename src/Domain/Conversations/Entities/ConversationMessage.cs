namespace IdolManagement.Domain.Conversations.Entities;

public class ConversationMessage
{
    public Guid Id { get; private set; }
    public Guid ConversationId { get; private set; }
    public SpeakerType SpeakerType { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public int Order { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private ConversationMessage() { }

    public static ConversationMessage Create(
        Guid conversationId,
        SpeakerType speakerType,
        string content,
        int order)
    {
        if (conversationId == Guid.Empty)
            throw new ArgumentException("ConversationId cannot be empty", nameof(conversationId));
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Content cannot be empty", nameof(content));
        if (content.Length > 1000)
            throw new ArgumentException("Content cannot exceed 1000 characters", nameof(content));
        if (order < 0)
            throw new ArgumentException("Order must be non-negative", nameof(order));

        return new ConversationMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            SpeakerType = speakerType,
            Content = content,
            Order = order,
            CreatedAt = DateTime.UtcNow
        };
    }
}
