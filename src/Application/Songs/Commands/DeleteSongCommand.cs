using IdolManagement.Domain.Songs.Repositories;

namespace IdolManagement.Application.Songs.Commands;

public record DeleteSongCommand(Guid Id);

public class DeleteSongHandler
{
    private readonly ISongRepository _songRepository;

    public DeleteSongHandler(ISongRepository songRepository)
    {
        _songRepository = songRepository;
    }

    public async Task<bool> HandleAsync(DeleteSongCommand command, CancellationToken cancellationToken = default)
    {
        var song = await _songRepository.GetByIdAsync(command.Id, cancellationToken);
        if (song == null)
            return false;

        await _songRepository.DeleteAsync(command.Id, cancellationToken);
        return true;
    }
}
