namespace IdolManagement.Application.Songs.DTOs;

public record SongDto(
    Guid Id,
    Guid GroupId,
    string Title,
    string Lyricist,
    string Composer,
    string? Arranger,
    string? Lyrics,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record SongSummaryDto(
    Guid Id,
    Guid GroupId,
    string Title,
    string Lyricist,
    string Composer,
    string? Arranger,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateSongDto(
    Guid GroupId,
    string Title,
    string Lyricist,
    string Composer,
    string? Arranger,
    string? Lyrics
);

public record UpdateSongDto(
    string Title,
    string Lyricist,
    string Composer,
    string? Arranger,
    string? Lyrics
);
