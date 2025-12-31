using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Application.Songs.DTOs;
using IdolManagement.Domain.Songs.Repositories;

namespace IdolManagement.Application.Songs.Queries;

public record GetAllSongsQuery;

public class GetAllSongsHandler
{
    private readonly ISongRepository _songRepository;

    public GetAllSongsHandler(ISongRepository songRepository)
    {
        _songRepository = songRepository;
    }

    public async Task<IEnumerable<SongSummaryDto>> HandleAsync(GetAllSongsQuery query, CancellationToken cancellationToken = default)
    {
        var songs = await _songRepository.GetAllAsync(cancellationToken);
        return SongMapper.ToSummaryDto(songs);
    }
}
