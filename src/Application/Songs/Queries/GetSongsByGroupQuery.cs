using IdolManagement.Application.Songs.DTOs;
using IdolManagement.Domain.Songs.Entities;
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
        return songs.Select(ToSummaryDto);
    }

    private static SongSummaryDto ToSummaryDto(Song song) => new(
        song.Id,
        song.GroupId,
        song.Title,
        song.Lyricist,
        song.Composer,
        song.Arranger,
        song.CreatedAt,
        song.UpdatedAt
    );
}
