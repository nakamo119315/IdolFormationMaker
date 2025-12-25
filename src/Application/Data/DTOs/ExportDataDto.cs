namespace IdolManagement.Application.Data.DTOs;

public record ExportDataDto
{
    public string Version { get; init; } = "1.0";
    public DateTime ExportedAt { get; init; } = DateTime.UtcNow;
    public List<ExportGroupDto> Groups { get; init; } = new();
    public List<ExportMemberDto> Members { get; init; } = new();
    public List<ExportFormationDto> Formations { get; init; } = new();
    public List<ExportSongDto> Songs { get; init; } = new();
    public List<ExportSetlistDto> Setlists { get; init; } = new();
}

public record ExportGroupDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? DebutDate { get; init; }
}

public record ExportMemberDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string BirthDate { get; init; } = string.Empty;
    public string? Birthplace { get; init; }
    public string? PenLightColor1 { get; init; }
    public string? PenLightColor2 { get; init; }
    public Guid? GroupId { get; init; }
    public List<ExportMemberImageDto> Images { get; init; } = new();
}

public record ExportMemberImageDto
{
    public Guid Id { get; init; }
    public string Url { get; init; } = string.Empty;
    public bool IsPrimary { get; init; }
}

public record ExportFormationDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public Guid GroupId { get; init; }
    public List<ExportFormationPositionDto> Positions { get; init; } = new();
}

public record ExportFormationPositionDto
{
    public Guid Id { get; init; }
    public Guid MemberId { get; init; }
    public int PositionNumber { get; init; }
    public int Row { get; init; }
    public int Column { get; init; }
}

public record ExportSongDto
{
    public Guid Id { get; init; }
    public Guid GroupId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Lyricist { get; init; } = string.Empty;
    public string Composer { get; init; } = string.Empty;
    public string? Arranger { get; init; }
    public string? Lyrics { get; init; }
}

public record ExportSetlistDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public Guid GroupId { get; init; }
    public string? EventDate { get; init; }
    public List<ExportSetlistItemDto> Items { get; init; } = new();
}

public record ExportSetlistItemDto
{
    public Guid Id { get; init; }
    public Guid SongId { get; init; }
    public int Order { get; init; }
    public Guid? CenterMemberId { get; init; }
    public List<Guid> ParticipantMemberIds { get; init; } = new();
}

public record ImportResultDto
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public ImportCountsDto Counts { get; init; } = new();
}

public record ImportCountsDto
{
    public int Groups { get; init; }
    public int Members { get; init; }
    public int Formations { get; init; }
    public int Songs { get; init; }
    public int Setlists { get; init; }
}
