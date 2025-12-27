using IdolManagement.Application.Shared;
using IdolManagement.Application.Songs.DTOs;
using IdolManagement.Domain.Songs.Entities;
using IdolManagement.Domain.Songs.Repositories;

namespace IdolManagement.Application.Songs.Queries;

public record GetSongsPagedQuery(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    Guid? GroupId = null
);

public class GetSongsPagedHandler
{
    private readonly ISongRepository _songRepository;

    public GetSongsPagedHandler(ISongRepository songRepository)
    {
        _songRepository = songRepository;
    }

    public async Task<PagedResult<SongSummaryDto>> HandleAsync(GetSongsPagedQuery query, CancellationToken cancellationToken = default)
    {
        var (songs, totalCount) = await _songRepository.GetPagedAsync(
            query.Page,
            query.PageSize,
            query.Search,
            query.GroupId,
            cancellationToken);

        var items = songs.Select(ToDto);

        return new PagedResult<SongSummaryDto>(items, totalCount, query.Page, query.PageSize);
    }

    private static SongSummaryDto ToDto(Song song) => new(
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
