using IdolManagement.Domain.Shared.Interfaces;

namespace IdolManagement.Domain.Songs.Entities;

public class Song : IEntity
{
    public Guid Id { get; private set; }
    public Guid GroupId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Lyricist { get; private set; } = string.Empty;
    public string Composer { get; private set; } = string.Empty;
    public string? Arranger { get; private set; }
    public string? Lyrics { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private Song() { }

    public static Song Create(
        Guid groupId,
        string title,
        string lyricist,
        string composer,
        string? arranger = null,
        string? lyrics = null)
    {
        if (groupId == Guid.Empty)
            throw new ArgumentException("GroupId cannot be empty", nameof(groupId));
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title cannot be empty", nameof(title));
        if (string.IsNullOrWhiteSpace(lyricist))
            throw new ArgumentException("Lyricist cannot be empty", nameof(lyricist));
        if (string.IsNullOrWhiteSpace(composer))
            throw new ArgumentException("Composer cannot be empty", nameof(composer));

        return new Song
        {
            Id = Guid.NewGuid(),
            GroupId = groupId,
            Title = title,
            Lyricist = lyricist,
            Composer = composer,
            Arranger = arranger,
            Lyrics = lyrics,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Update(
        string title,
        string lyricist,
        string composer,
        string? arranger,
        string? lyrics)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title cannot be empty", nameof(title));
        if (string.IsNullOrWhiteSpace(lyricist))
            throw new ArgumentException("Lyricist cannot be empty", nameof(lyricist));
        if (string.IsNullOrWhiteSpace(composer))
            throw new ArgumentException("Composer cannot be empty", nameof(composer));

        Title = title;
        Lyricist = lyricist;
        Composer = composer;
        Arranger = arranger;
        Lyrics = lyrics;
        UpdatedAt = DateTime.UtcNow;
    }
}
