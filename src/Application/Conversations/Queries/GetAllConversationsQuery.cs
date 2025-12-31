using IdolManagement.Application.Conversations.DTOs;
using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Domain.Conversations.Repositories;

namespace IdolManagement.Application.Conversations.Queries;

public record GetAllConversationsQuery(Guid? MemberId = null);

public class GetAllConversationsHandler
{
    private readonly IConversationRepository _conversationRepository;

    public GetAllConversationsHandler(IConversationRepository conversationRepository)
    {
        _conversationRepository = conversationRepository;
    }

    public async Task<IEnumerable<ConversationSummaryDto>> HandleAsync(
        GetAllConversationsQuery query,
        CancellationToken cancellationToken = default)
    {
        var conversations = await _conversationRepository.GetAllAsync(query.MemberId, cancellationToken);
        return ConversationMapper.ToSummaryDto(conversations);
    }
}
