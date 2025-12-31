using IdolManagement.Application.Conversations.DTOs;
using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Domain.Conversations.Entities;
using IdolManagement.Domain.Conversations.Repositories;
using IdolManagement.Domain.Members.Repositories;

namespace IdolManagement.Application.Conversations.Commands;

public record CreateConversationCommand(CreateConversationDto Dto);

public class CreateConversationHandler
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IMemberRepository _memberRepository;

    public CreateConversationHandler(
        IConversationRepository conversationRepository,
        IMemberRepository memberRepository)
    {
        _conversationRepository = conversationRepository;
        _memberRepository = memberRepository;
    }

    public async Task<ConversationDto> HandleAsync(
        CreateConversationCommand command,
        CancellationToken cancellationToken = default)
    {
        var dto = command.Dto;

        // Get member name if memberId is provided
        string? memberName = null;
        if (dto.MemberId.HasValue)
        {
            var member = await _memberRepository.GetByIdAsync(dto.MemberId.Value, cancellationToken);
            memberName = member?.Name;
        }

        // Create conversation with member info
        var conversationDate = dto.ConversationDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var conversation = MeetGreetConversation.Create(
            dto.Title,
            conversationDate,
            dto.MemberId,
            memberName
        );

        // Add messages
        foreach (var messageDto in dto.Messages.OrderBy(m => m.Order))
        {
            conversation.AddMessage(messageDto.SpeakerType, messageDto.Content);
        }

        // Save to repository
        var savedConversation = await _conversationRepository.AddAsync(conversation, cancellationToken);

        return ConversationMapper.ToDto(savedConversation);
    }
}
