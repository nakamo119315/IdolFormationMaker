using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Application.Songs.DTOs;
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

        return SongMapper.ToDto(song);
    }
}
