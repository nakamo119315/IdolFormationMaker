using IdolManagement.Application.Conversations.DTOs;
using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Domain.Conversations.Repositories;

namespace IdolManagement.Application.Conversations.Queries;

public record GetConversationQuery(Guid Id);

public class GetConversationHandler
{
    private readonly IConversationRepository _conversationRepository;

    public GetConversationHandler(IConversationRepository conversationRepository)
    {
        _conversationRepository = conversationRepository;
    }

    public async Task<ConversationDto?> HandleAsync(
        GetConversationQuery query,
        CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(query.Id, cancellationToken);
        if (conversation == null)
            return null;

        return ConversationMapper.ToDto(conversation);
    }
}
