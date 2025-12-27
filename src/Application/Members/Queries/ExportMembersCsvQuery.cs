using IdolManagement.Domain.Groups.Repositories;
using IdolManagement.Domain.Members.Repositories;
using System.Text;

namespace IdolManagement.Application.Members.Queries;

public record ExportMembersCsvQuery;

public class ExportMembersCsvHandler
{
    private readonly IMemberRepository _memberRepository;
    private readonly IGroupRepository _groupRepository;

    public ExportMembersCsvHandler(IMemberRepository memberRepository, IGroupRepository groupRepository)
    {
        _memberRepository = memberRepository;
        _groupRepository = groupRepository;
    }

    public async Task<byte[]> HandleAsync(ExportMembersCsvQuery query, CancellationToken cancellationToken = default)
    {
        var members = await _memberRepository.GetAllAsync(cancellationToken);
        var groups = await _groupRepository.GetAllAsync(cancellationToken);
        var groupDict = groups.ToDictionary(g => g.Id, g => g.Name);

        var sb = new StringBuilder();

        // BOM for Excel compatibility
        sb.Append('\uFEFF');

        // Header
        sb.AppendLine("ID,名前,生年月日,出身地,ペンライトカラー1,ペンライトカラー2,グループ,期,卒業済み,作成日時,更新日時");

        foreach (var member in members.OrderBy(m => m.Name))
        {
            var groupName = member.GroupId.HasValue && groupDict.TryGetValue(member.GroupId.Value, out var name) ? name : "";
            var generation = member.Generation?.ToString() ?? "";
            var isGraduated = member.IsGraduated ? "○" : "";

            sb.AppendLine(string.Join(",",
                EscapeCsv(member.Id.ToString()),
                EscapeCsv(member.Name),
                EscapeCsv(member.BirthDate.ToString("yyyy-MM-dd")),
                EscapeCsv(member.Birthplace ?? ""),
                EscapeCsv(member.PenLightColor1 ?? ""),
                EscapeCsv(member.PenLightColor2 ?? ""),
                EscapeCsv(groupName),
                EscapeCsv(generation),
                EscapeCsv(isGraduated),
                EscapeCsv(member.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")),
                EscapeCsv(member.UpdatedAt.ToString("yyyy-MM-dd HH:mm:ss"))
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
