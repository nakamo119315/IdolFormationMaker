using IdolManagement.Domain.Conversations.Entities;

namespace IdolManagement.Application.Conversations.DTOs;

public record ConversationDto(
    Guid Id,
    string Title,
    Guid? MemberId,
    string? MemberName,
    DateOnly ConversationDate,
    IEnumerable<MessageDto> Messages,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ConversationSummaryDto(
    Guid Id,
    string Title,
    Guid? MemberId,
    string? MemberName,
    DateOnly ConversationDate,
    int MessageCount,
    string PreviewText,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record MessageDto(
    Guid Id,
    SpeakerType SpeakerType,
    string Content,
    int Order,
    DateTime CreatedAt
);

public record CreateConversationDto(
    string Title,
    Guid? MemberId,
    DateOnly? ConversationDate,
    IEnumerable<CreateMessageDto> Messages
);

public record CreateMessageDto(
    SpeakerType SpeakerType,
    string Content,
    int Order
);

public record UpdateConversationDto(
    string Title,
    Guid? MemberId,
    DateOnly? ConversationDate,
    IEnumerable<CreateMessageDto> Messages
);

public record AddMessageDto(
    SpeakerType SpeakerType,
    string Content
);
