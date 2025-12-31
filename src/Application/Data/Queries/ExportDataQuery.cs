using IdolManagement.Application.Data.DTOs;
using IdolManagement.Domain.Groups.Repositories;
using IdolManagement.Domain.Members.Repositories;
using IdolManagement.Domain.Formations.Repositories;
using IdolManagement.Domain.Songs.Repositories;
using IdolManagement.Domain.Setlists.Repositories;

namespace IdolManagement.Application.Data.Queries;

public record ExportDataQuery;

public class ExportDataHandler
{
    private readonly IGroupRepository _groupRepository;
    private readonly IMemberRepository _memberRepository;
    private readonly IFormationRepository _formationRepository;
    private readonly ISongRepository _songRepository;
    private readonly ISetlistRepository _setlistRepository;

    public ExportDataHandler(
        IGroupRepository groupRepository,
        IMemberRepository memberRepository,
        IFormationRepository formationRepository,
        ISongRepository songRepository,
        ISetlistRepository setlistRepository)
    {
        _groupRepository = groupRepository;
        _memberRepository = memberRepository;
        _formationRepository = formationRepository;
        _songRepository = songRepository;
        _setlistRepository = setlistRepository;
    }

    public async Task<ExportDataDto> HandleAsync(ExportDataQuery query, CancellationToken cancellationToken = default)
    {
        var groups = await _groupRepository.GetAllAsync(cancellationToken);
        var members = await _memberRepository.GetAllAsync(null, null, null, cancellationToken);
        var formations = await _formationRepository.GetAllAsync(cancellationToken);
        var songs = await _songRepository.GetAllAsync(cancellationToken);
        var setlists = await _setlistRepository.GetAllAsync(cancellationToken);

        return new ExportDataDto
        {
            Version = "1.0",
            ExportedAt = DateTime.UtcNow,
            Groups = groups.Select(g => new ExportGroupDto
            {
                Id = g.Id,
                Name = g.Name,
                DebutDate = g.DebutDate?.ToString("yyyy-MM-dd")
            }).ToList(),
            Members = members.Select(m => new ExportMemberDto
            {
                Id = m.Id,
                Name = m.Name,
                BirthDate = m.BirthDate.ToString("yyyy-MM-dd"),
                Birthplace = m.Birthplace,
                PenLightColor1 = m.PenLightColor1,
                PenLightColor2 = m.PenLightColor2,
                GroupId = m.GroupId,
                Images = m.Images.Select(i => new ExportMemberImageDto
                {
                    Id = i.Id,
                    Url = i.Url,
                    IsPrimary = i.IsPrimary
                }).ToList()
            }).ToList(),
            Formations = formations.Select(f => new ExportFormationDto
            {
                Id = f.Id,
                Name = f.Name,
                GroupId = f.GroupId,
                Positions = f.Positions.Select(p => new ExportFormationPositionDto
                {
                    Id = p.Id,
                    MemberId = p.MemberId,
                    PositionNumber = p.PositionNumber,
                    Row = p.Row,
                    Column = p.Column
                }).ToList()
            }).ToList(),
            Songs = songs.Select(s => new ExportSongDto
            {
                Id = s.Id,
                GroupId = s.GroupId,
                Title = s.Title,
                Lyricist = s.Lyricist,
                Composer = s.Composer,
                Arranger = s.Arranger,
                Lyrics = s.Lyrics
            }).ToList(),
            Setlists = setlists.Select(s => new ExportSetlistDto
            {
                Id = s.Id,
                Name = s.Name,
                GroupId = s.GroupId,
                EventDate = s.EventDate?.ToString("yyyy-MM-dd"),
                Items = s.Items.Select(i => new ExportSetlistItemDto
                {
                    Id = i.Id,
                    SongId = i.SongId,
                    Order = i.Order,
                    CenterMemberId = i.CenterMemberId,
                    ParticipantMemberIds = i.Participants.Select(p => p.MemberId).ToList()
                }).ToList()
            }).ToList()
        };
    }
}
