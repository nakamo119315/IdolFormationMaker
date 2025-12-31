using IdolManagement.Application.Conversations.DTOs;
using IdolManagement.Domain.Conversations.Entities;

namespace IdolManagement.Application.Shared.Mappers;

public static class ConversationMapper
{
    public static ConversationDto ToDto(MeetGreetConversation conversation) => new(
        conversation.Id,
        conversation.Title,
        conversation.MemberId,
        conversation.MemberName,
        conversation.ConversationDate,
        conversation.Messages.Select(ToDto).OrderBy(m => m.Order),
        conversation.CreatedAt,
        conversation.UpdatedAt
    );

    public static ConversationSummaryDto ToSummaryDto(MeetGreetConversation conversation)
    {
        // Create preview text from first 2 messages, max 50 chars
        var previewMessages = conversation.Messages
            .OrderBy(m => m.Order)
            .Take(2)
            .Select(m => m.Content);
        var previewText = string.Join(" ", previewMessages);
        if (previewText.Length > 50)
        {
            previewText = previewText.Substring(0, 50) + "...";
        }

        return new ConversationSummaryDto(
            conversation.Id,
            conversation.Title,
            conversation.MemberId,
            conversation.MemberName,
            conversation.ConversationDate,
            conversation.Messages.Count,
            previewText,
            conversation.CreatedAt,
            conversation.UpdatedAt
        );
    }

    public static MessageDto ToDto(ConversationMessage message) => new(
        message.Id,
        message.SpeakerType,
        message.Content,
        message.Order,
        message.CreatedAt
    );

    public static IEnumerable<ConversationDto> ToDto(IEnumerable<MeetGreetConversation> conversations) =>
        conversations.Select(ToDto);

    public static IEnumerable<ConversationSummaryDto> ToSummaryDto(IEnumerable<MeetGreetConversation> conversations) =>
        conversations.Select(ToSummaryDto);
}
