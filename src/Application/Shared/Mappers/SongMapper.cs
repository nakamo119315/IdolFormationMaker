using IdolManagement.Application.Songs.DTOs;
using IdolManagement.Domain.Songs.Entities;

namespace IdolManagement.Application.Shared.Mappers;

public static class SongMapper
{
    public static SongDto ToDto(Song song) => new(
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

    public static SongSummaryDto ToSummaryDto(Song song) => new(
        song.Id,
        song.GroupId,
        song.Title,
        song.Lyricist,
        song.Composer,
        song.Arranger,
        song.CreatedAt,
        song.UpdatedAt
    );

    public static IEnumerable<SongDto> ToDto(IEnumerable<Song> songs) =>
        songs.Select(ToDto);

    public static IEnumerable<SongSummaryDto> ToSummaryDto(IEnumerable<Song> songs) =>
        songs.Select(ToSummaryDto);
}
