using IdolManagement.Domain.Conversations.Repositories;

namespace IdolManagement.Application.Conversations.Commands;

public record DeleteConversationCommand(Guid Id);

public class DeleteConversationHandler
{
    private readonly IConversationRepository _conversationRepository;

    public DeleteConversationHandler(IConversationRepository conversationRepository)
    {
        _conversationRepository = conversationRepository;
    }

    public async Task<bool> HandleAsync(
        DeleteConversationCommand command,
        CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(command.Id, cancellationToken);
        if (conversation == null)
            return false;

        await _conversationRepository.DeleteAsync(command.Id, cancellationToken);
        return true;
    }
}
