using IdolManagement.Domain.Shared.Interfaces;

namespace IdolManagement.Domain.Conversations.Entities;

public class MeetGreetConversation : IEntity
{
    public Guid Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public Guid? MemberId { get; private set; }
    public string? MemberName { get; private set; }
    public DateOnly ConversationDate { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private readonly List<ConversationMessage> _messages = new();
    public IReadOnlyCollection<ConversationMessage> Messages => _messages.AsReadOnly();

    private MeetGreetConversation() { }

    public static MeetGreetConversation Create(
        string title,
        DateOnly conversationDate,
        Guid? memberId = null,
        string? memberName = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title cannot be empty", nameof(title));
        if (title.Length > 100)
            throw new ArgumentException("Title cannot exceed 100 characters", nameof(title));

        var now = DateTime.UtcNow;
        return new MeetGreetConversation
        {
            Id = Guid.NewGuid(),
            Title = title,
            MemberId = memberId,
            MemberName = memberName,
            ConversationDate = conversationDate,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void Update(string title, Guid? memberId = null, string? memberName = null, DateOnly? conversationDate = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title cannot be empty", nameof(title));
        if (title.Length > 100)
            throw new ArgumentException("Title cannot exceed 100 characters", nameof(title));

        Title = title;
        MemberId = memberId;
        MemberName = memberName;
        if (conversationDate.HasValue)
            ConversationDate = conversationDate.Value;
        UpdatedAt = DateTime.UtcNow;
    }

    public ConversationMessage AddMessage(SpeakerType speakerType, string content)
    {
        var order = _messages.Count > 0 ? _messages.Max(m => m.Order) + 1 : 0;
        var message = ConversationMessage.Create(Id, speakerType, content, order);
        _messages.Add(message);
        UpdatedAt = DateTime.UtcNow;
        return message;
    }

    public void SetMessages(IEnumerable<ConversationMessage> messages)
    {
        _messages.Clear();
        _messages.AddRange(messages);
        UpdatedAt = DateTime.UtcNow;
    }
}
