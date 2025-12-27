using IdolManagement.Domain.Groups.Repositories;
using IdolManagement.Domain.Songs.Repositories;
using System.Text;

namespace IdolManagement.Application.Songs.Queries;

public record ExportSongsCsvQuery;

public class ExportSongsCsvHandler
{
    private readonly ISongRepository _songRepository;
    private readonly IGroupRepository _groupRepository;

    public ExportSongsCsvHandler(ISongRepository songRepository, IGroupRepository groupRepository)
    {
        _songRepository = songRepository;
        _groupRepository = groupRepository;
    }

    public async Task<byte[]> HandleAsync(ExportSongsCsvQuery query, CancellationToken cancellationToken = default)
    {
        var songs = await _songRepository.GetAllAsync(cancellationToken);
        var groups = await _groupRepository.GetAllAsync(cancellationToken);
        var groupDict = groups.ToDictionary(g => g.Id, g => g.Name);

        var sb = new StringBuilder();

        // BOM for Excel compatibility
        sb.Append('\uFEFF');

        // Header
        sb.AppendLine("ID,タイトル,グループ,作詞,作曲,編曲,作成日時,更新日時");

        foreach (var song in songs.OrderBy(s => s.Title))
        {
            var groupName = groupDict.TryGetValue(song.GroupId, out var name) ? name : "";

            sb.AppendLine(string.Join(",",
                EscapeCsv(song.Id.ToString()),
                EscapeCsv(song.Title),
                EscapeCsv(groupName),
                EscapeCsv(song.Lyricist),
                EscapeCsv(song.Composer),
                EscapeCsv(song.Arranger ?? ""),
                EscapeCsv(song.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")),
                EscapeCsv(song.UpdatedAt.ToString("yyyy-MM-dd HH:mm:ss"))
            ));
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static string EscapeCsv(string value)
    {
        if (string.IsNullOrEmpty(value))
            return "";

        if (value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }

        return value;
    }
}
