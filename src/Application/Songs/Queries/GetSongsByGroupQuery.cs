using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Application.Songs.DTOs;
using IdolManagement.Domain.Songs.Repositories;

namespace IdolManagement.Application.Songs.Queries;

public record GetSongsByGroupQuery(Guid GroupId);

public class GetSongsByGroupHandler
{
    private readonly ISongRepository _songRepository;

    public GetSongsByGroupHandler(ISongRepository songRepository)
    {
        _songRepository = songRepository;
    }

    public async Task<IEnumerable<SongSummaryDto>> HandleAsync(GetSongsByGroupQuery query, CancellationToken cancellationToken = default)
    {
        var songs = await _songRepository.GetByGroupIdAsync(query.GroupId, cancellationToken);
        return SongMapper.ToSummaryDto(songs);
    }
}
