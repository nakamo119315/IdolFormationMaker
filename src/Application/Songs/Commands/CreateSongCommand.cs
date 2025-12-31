using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Application.Songs.DTOs;
using IdolManagement.Domain.Songs.Entities;
using IdolManagement.Domain.Songs.Repositories;

namespace IdolManagement.Application.Songs.Commands;

public record CreateSongCommand(CreateSongDto Dto);

public class CreateSongHandler
{
    private readonly ISongRepository _songRepository;

    public CreateSongHandler(ISongRepository songRepository)
    {
        _songRepository = songRepository;
    }

    public async Task<SongDto> HandleAsync(CreateSongCommand command, CancellationToken cancellationToken = default)
    {
        var song = Song.Create(
            command.Dto.GroupId,
            command.Dto.Title,
            command.Dto.Lyricist,
            command.Dto.Composer,
            command.Dto.Arranger,
            command.Dto.Lyrics
        );

        await _songRepository.AddAsync(song, cancellationToken);
        return SongMapper.ToDto(song);
    }
}
