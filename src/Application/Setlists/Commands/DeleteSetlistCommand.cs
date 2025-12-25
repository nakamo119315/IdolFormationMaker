using IdolManagement.Domain.Setlists.Repositories;

namespace IdolManagement.Application.Setlists.Commands;

public record DeleteSetlistCommand(Guid Id);

public class DeleteSetlistHandler
{
    private readonly ISetlistRepository _setlistRepository;

    public DeleteSetlistHandler(ISetlistRepository setlistRepository)
    {
        _setlistRepository = setlistRepository;
    }

    public async Task<bool> HandleAsync(DeleteSetlistCommand command, CancellationToken cancellationToken = default)
    {
        var setlist = await _setlistRepository.GetByIdAsync(command.Id, cancellationToken);
        if (setlist == null)
            return false;

        await _setlistRepository.DeleteAsync(command.Id, cancellationToken);
        return true;
    }
}
