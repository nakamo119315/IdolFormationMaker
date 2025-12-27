using IdolManagement.Domain.Songs.Repositories;

namespace IdolManagement.Application.Songs.Commands;

public record DeleteSongsBulkCommand(IEnumerable<Guid> Ids);

public class DeleteSongsBulkHandler(ISongRepository songRepository)
{
    public async Task<int> HandleAsync(DeleteSongsBulkCommand command, CancellationToken ct = default)
    {
        var deletedCount = 0;
        foreach (var id in command.Ids)
        {
            var song = await songRepository.GetByIdAsync(id, ct);
            if (song != null)
            {
                await songRepository.DeleteAsync(id, ct);
                deletedCount++;
            }
        }
        return deletedCount;
    }
}
