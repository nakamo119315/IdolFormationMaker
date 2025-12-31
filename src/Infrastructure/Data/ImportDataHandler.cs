using IdolManagement.Application.Data.DTOs;
using IdolManagement.Domain.Groups.Entities;
using IdolManagement.Domain.Groups.Repositories;
using IdolManagement.Domain.Members.Entities;
using IdolManagement.Domain.Members.Repositories;
using IdolManagement.Domain.Formations.Entities;
using IdolManagement.Domain.Formations.Repositories;
using IdolManagement.Domain.Songs.Entities;
using IdolManagement.Domain.Songs.Repositories;
using IdolManagement.Domain.Setlists.Entities;
using IdolManagement.Domain.Setlists.Repositories;
using IdolManagement.Domain.Conversations.Entities;
using IdolManagement.Domain.Conversations.Repositories;
using IdolManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IdolManagement.Infrastructure.Data;

public record ImportDataCommand(ExportDataDto Data, bool ClearExisting = false);

public class ImportDataHandler
{
    private readonly AppDbContext _context;
    private readonly IGroupRepository _groupRepository;
    private readonly IMemberRepository _memberRepository;
    private readonly IFormationRepository _formationRepository;
    private readonly ISongRepository _songRepository;
    private readonly ISetlistRepository _setlistRepository;
    private readonly IConversationRepository _conversationRepository;

    public ImportDataHandler(
        AppDbContext context,
        IGroupRepository groupRepository,
        IMemberRepository memberRepository,
        IFormationRepository formationRepository,
        ISongRepository songRepository,
        ISetlistRepository setlistRepository,
        IConversationRepository conversationRepository)
    {
        _context = context;
        _groupRepository = groupRepository;
        _memberRepository = memberRepository;
        _formationRepository = formationRepository;
        _songRepository = songRepository;
        _setlistRepository = setlistRepository;
        _conversationRepository = conversationRepository;
    }

    public async Task<ImportResultDto> HandleAsync(ImportDataCommand command, CancellationToken cancellationToken = default)
    {
        var data = command.Data;

        try
        {
            if (command.ClearExisting)
            {
                await ClearAllDataAsync(cancellationToken);
            }

            // ID mappings: old ID -> new ID
            var groupIdMap = new Dictionary<Guid, Guid>();
            var memberIdMap = new Dictionary<Guid, Guid>();
            var songIdMap = new Dictionary<Guid, Guid>();

            // 1. Import groups first (no dependencies)
            foreach (var groupDto in data.Groups)
            {
                var existingGroup = await _groupRepository.GetByIdAsync(groupDto.Id, cancellationToken);
                if (existingGroup != null)
                {
                    groupIdMap[groupDto.Id] = groupDto.Id;
                    continue;
                }

                var debutDate = string.IsNullOrEmpty(groupDto.DebutDate)
                    ? (DateOnly?)null
                    : DateOnly.Parse(groupDto.DebutDate);

                var group = Group.Create(groupDto.Name, debutDate);
                await _groupRepository.AddAsync(group, cancellationToken);
                groupIdMap[groupDto.Id] = group.Id;
            }

            // 2. Import members (depends on groups)
            foreach (var memberDto in data.Members)
            {
                var existingMember = await _memberRepository.GetByIdAsync(memberDto.Id, cancellationToken);
                if (existingMember != null)
                {
                    memberIdMap[memberDto.Id] = memberDto.Id;
                    continue;
                }

                var birthDate = DateOnly.Parse(memberDto.BirthDate);
                var newGroupId = memberDto.GroupId.HasValue && groupIdMap.ContainsKey(memberDto.GroupId.Value)
                    ? groupIdMap[memberDto.GroupId.Value]
                    : memberDto.GroupId;

                var member = Member.Create(
                    memberDto.Name,
                    birthDate,
                    memberDto.Birthplace,
                    memberDto.PenLightColor1,
                    memberDto.PenLightColor2,
                    newGroupId);

                // Add images
                foreach (var imageDto in memberDto.Images)
                {
                    var image = MemberImage.Create(member.Id, imageDto.Url, imageDto.IsPrimary);
                    member.AddImage(image);
                }

                await _memberRepository.AddAsync(member, cancellationToken);
                memberIdMap[memberDto.Id] = member.Id;
            }

            // 3. Import songs (depends on groups)
            foreach (var songDto in data.Songs)
            {
                var existingSong = await _songRepository.GetByIdAsync(songDto.Id, cancellationToken);
                if (existingSong != null)
                {
                    songIdMap[songDto.Id] = songDto.Id;
                    continue;
                }

                var newGroupId = groupIdMap.ContainsKey(songDto.GroupId)
                    ? groupIdMap[songDto.GroupId]
                    : songDto.GroupId;

                var song = Song.Create(
                    newGroupId,
                    songDto.Title,
                    songDto.Lyricist,
                    songDto.Composer,
                    songDto.Arranger,
                    songDto.Lyrics);

                await _songRepository.AddAsync(song, cancellationToken);
                songIdMap[songDto.Id] = song.Id;
            }

            // 4. Import formations (depends on groups and members)
            foreach (var formationDto in data.Formations)
            {
                var existingFormation = await _formationRepository.GetByIdAsync(formationDto.Id, cancellationToken);
                if (existingFormation != null)
                {
                    continue;
                }

                var newGroupId = groupIdMap.ContainsKey(formationDto.GroupId)
                    ? groupIdMap[formationDto.GroupId]
                    : formationDto.GroupId;

                var formation = Formation.Create(formationDto.Name, newGroupId);

                foreach (var posDto in formationDto.Positions)
                {
                    var newMemberId = memberIdMap.ContainsKey(posDto.MemberId)
                        ? memberIdMap[posDto.MemberId]
                        : posDto.MemberId;

                    var position = FormationPosition.Create(
                        formation.Id,
                        newMemberId,
                        posDto.PositionNumber,
                        posDto.Row,
                        posDto.Column);
                    formation.AddPosition(position);
                }

                await _formationRepository.AddAsync(formation, cancellationToken);
            }

            // 5. Import setlists (depends on groups, songs, and members)
            foreach (var setlistDto in data.Setlists)
            {
                var existingSetlist = await _setlistRepository.GetByIdAsync(setlistDto.Id, cancellationToken);
                if (existingSetlist != null)
                {
                    continue;
                }

                var newGroupId = groupIdMap.ContainsKey(setlistDto.GroupId)
                    ? groupIdMap[setlistDto.GroupId]
                    : setlistDto.GroupId;

                var eventDate = string.IsNullOrEmpty(setlistDto.EventDate)
                    ? (DateOnly?)null
                    : DateOnly.Parse(setlistDto.EventDate);

                var setlist = Setlist.Create(setlistDto.Name, newGroupId, eventDate);

                foreach (var itemDto in setlistDto.Items)
                {
                    var newSongId = songIdMap.ContainsKey(itemDto.SongId)
                        ? songIdMap[itemDto.SongId]
                        : itemDto.SongId;

                    var newCenterId = itemDto.CenterMemberId.HasValue && memberIdMap.ContainsKey(itemDto.CenterMemberId.Value)
                        ? memberIdMap[itemDto.CenterMemberId.Value]
                        : itemDto.CenterMemberId;

                    var item = setlist.AddItem(newSongId, itemDto.Order, newCenterId);

                    foreach (var participantId in itemDto.ParticipantMemberIds)
                    {
                        var newParticipantId = memberIdMap.ContainsKey(participantId)
                            ? memberIdMap[participantId]
                            : participantId;
                        item.AddParticipant(newParticipantId);
                    }
                }

                await _setlistRepository.AddAsync(setlist, cancellationToken);
            }

            // 6. Import conversations (depends on members)
            foreach (var conversationDto in data.Conversations ?? new List<ExportConversationDto>())
            {
                var existingConversation = await _conversationRepository.GetByIdAsync(conversationDto.Id, cancellationToken);
                if (existingConversation != null)
                {
                    continue;
                }

                var conversationDate = DateOnly.Parse(conversationDto.ConversationDate);
                var newMemberId = conversationDto.MemberId.HasValue && memberIdMap.ContainsKey(conversationDto.MemberId.Value)
                    ? memberIdMap[conversationDto.MemberId.Value]
                    : conversationDto.MemberId;

                var conversation = MeetGreetConversation.Create(
                    conversationDto.Title,
                    conversationDate,
                    newMemberId,
                    conversationDto.MemberName);

                foreach (var messageDto in conversationDto.Messages.OrderBy(m => m.Order))
                {
                    conversation.AddMessage((SpeakerType)messageDto.SpeakerType, messageDto.Content);
                }

                await _conversationRepository.AddAsync(conversation, cancellationToken);
            }

            await _context.SaveChangesAsync(cancellationToken);

            return new ImportResultDto
            {
                Success = true,
                Message = "インポートが完了しました",
                Counts = new ImportCountsDto
                {
                    Groups = data.Groups.Count,
                    Members = data.Members.Count,
                    Formations = data.Formations.Count,
                    Songs = data.Songs.Count,
                    Setlists = data.Setlists.Count,
                    Conversations = data.Conversations?.Count ?? 0
                }
            };
        }
        catch (Exception ex)
        {
            return new ImportResultDto
            {
                Success = false,
                Message = $"インポートに失敗しました: {ex.Message}",
                Counts = new ImportCountsDto()
            };
        }
    }

    private async Task ClearAllDataAsync(CancellationToken cancellationToken)
    {
        // Delete in reverse order of dependencies
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM ConversationMessages", cancellationToken);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM MeetGreetConversations", cancellationToken);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM SetlistItemParticipants", cancellationToken);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM SetlistItems", cancellationToken);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM Setlists", cancellationToken);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM FormationPositions", cancellationToken);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM Formations", cancellationToken);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM Songs", cancellationToken);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM MemberImages", cancellationToken);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM Members", cancellationToken);
        await _context.Database.ExecuteSqlRawAsync("DELETE FROM Groups", cancellationToken);
    }
}
