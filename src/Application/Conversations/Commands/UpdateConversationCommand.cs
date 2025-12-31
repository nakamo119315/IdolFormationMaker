using IdolManagement.Application.Conversations.DTOs;
using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Domain.Conversations.Repositories;

namespace IdolManagement.Application.Conversations.Commands;

public record UpdateConversationCommand(Guid Id, UpdateConversationDto Dto);

public class UpdateConversationHandler
{
    private readonly IConversationRepository _conversationRepository;

    public UpdateConversationHandler(IConversationRepository conversationRepository)
    {
        _conversationRepository = conversationRepository;
    }

    public async Task<ConversationDto?> HandleAsync(
        UpdateConversationCommand command,
        CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(command.Id, cancellationToken);
        if (conversation == null)
            return null;

        // Update conversation with new title and messages
        var messages = command.Dto.Messages.Select(m => new ConversationMessageData(
            m.SpeakerType,
            m.Content,
            m.Order
        ));

        await _conversationRepository.UpdateAsync(
            command.Id,
            command.Dto.Title,
            command.Dto.MemberId,
            command.Dto.ConversationDate,
            messages,
            cancellationToken
        );

        // Fetch updated conversation
        var updatedConversation = await _conversationRepository.GetByIdAsync(command.Id, cancellationToken);
        if (updatedConversation == null)
            return null;

        return ConversationMapper.ToDto(updatedConversation);
    }
}
