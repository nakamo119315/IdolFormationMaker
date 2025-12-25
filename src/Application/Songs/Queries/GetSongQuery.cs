using IdolManagement.Application.Songs.DTOs;
using IdolManagement.Domain.Songs.Entities;
using IdolManagement.Domain.Songs.Repositories;

namespace IdolManagement.Application.Songs.Queries;

public record GetSongQuery(Guid Id);

public class GetSongHandler
{
    private readonly ISongRepository _songRepository;

    public GetSongHandler(ISongRepository songRepository)
    {
        _songRepository = songRepository;
    }

    public async Task<SongDto?> HandleAsync(GetSongQuery query, CancellationToken cancellationToken = default)
    {
        var song = await _songRepository.GetByIdAsync(query.Id, cancellationToken);
        if (song == null)
            return null;

        return ToDto(song);
    }

    private static SongDto ToDto(Song song) => new(
        song.Id,
        song.GroupId,
        song.Title,
        song.Lyricist,
        song.Composer,
        song.Arranger,
        song.Lyrics,
        song.CreatedAt,
        song.UpdatedAt
    );
}
