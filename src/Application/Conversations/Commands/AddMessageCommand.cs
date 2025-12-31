using IdolManagement.Application.Conversations.DTOs;
using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Domain.Conversations.Repositories;

namespace IdolManagement.Application.Conversations.Commands;

public record AddMessageCommand(Guid ConversationId, AddMessageDto Dto);

public class AddMessageHandler
{
    private readonly IConversationRepository _conversationRepository;

    public AddMessageHandler(IConversationRepository conversationRepository)
    {
        _conversationRepository = conversationRepository;
    }

    public async Task<MessageDto?> HandleAsync(
        AddMessageCommand command,
        CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(command.ConversationId, cancellationToken);
        if (conversation == null)
            return null;

        var message = conversation.AddMessage(command.Dto.SpeakerType, command.Dto.Content);

        // Update conversation with new message (repository will handle persistence)
        var messages = conversation.Messages.Select(m => new ConversationMessageData(
            m.SpeakerType,
            m.Content,
            m.Order
        ));
        await _conversationRepository.UpdateAsync(
            conversation.Id,
            conversation.Title,
            conversation.MemberId,
            conversation.ConversationDate,
            messages,
            cancellationToken
        );

        return ConversationMapper.ToDto(message);
    }
}
