using IdolManagement.Application.Songs.DTOs;
using IdolManagement.Domain.Songs.Entities;
using IdolManagement.Domain.Songs.Repositories;

namespace IdolManagement.Application.Songs.Commands;

public record UpdateSongCommand(Guid Id, UpdateSongDto Dto);

public class UpdateSongHandler
{
    private readonly ISongRepository _songRepository;

    public UpdateSongHandler(ISongRepository songRepository)
    {
        _songRepository = songRepository;
    }

    public async Task<SongDto?> HandleAsync(UpdateSongCommand command, CancellationToken cancellationToken = default)
    {
        var song = await _songRepository.GetByIdAsync(command.Id, cancellationToken);
        if (song == null)
            return null;

        song.Update(
            command.Dto.Title,
            command.Dto.Lyricist,
            command.Dto.Composer,
            command.Dto.Arranger,
            command.Dto.Lyrics
        );

        await _songRepository.UpdateAsync(song, cancellationToken);
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
