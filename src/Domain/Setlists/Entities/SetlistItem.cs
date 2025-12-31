namespace IdolManagement.Domain.Setlists.Entities;

public class SetlistItem
{
    public Guid Id { get; private set; }
    public Guid SetlistId { get; private set; }
    public Guid SongId { get; private set; }
    public int Order { get; private set; }
    public Guid? CenterMemberId { get; private set; }

    private readonly List<SetlistItemParticipant> _participants = new();
    public IReadOnlyCollection<SetlistItemParticipant> Participants => _participants.AsReadOnly();

    private SetlistItem() { }

    public static SetlistItem Create(
        Guid setlistId,
        Guid songId,
        int order,
        Guid? centerMemberId = null)
    {
        if (setlistId == Guid.Empty)
            throw new ArgumentException("SetlistId cannot be empty", nameof(setlistId));
        if (songId == Guid.Empty)
            throw new ArgumentException("SongId cannot be empty", nameof(songId));
        if (order < 1)
            throw new ArgumentException("Order must be at least 1", nameof(order));

        return new SetlistItem
        {
            Id = Guid.NewGuid(),
            SetlistId = setlistId,
            SongId = songId,
            Order = order,
            CenterMemberId = centerMemberId
        };
    }

    public void Update(int order, Guid? centerMemberId)
    {
        if (order < 1)
            throw new ArgumentException("Order must be at least 1", nameof(order));

        Order = order;
        CenterMemberId = centerMemberId;
    }

    public void AddParticipant(Guid memberId)
    {
        if (memberId == Guid.Empty)
            throw new ArgumentException("MemberId cannot be empty", nameof(memberId));

        if (_participants.Any(p => p.MemberId == memberId))
            return;

        _participants.Add(SetlistItemParticipant.Create(Id, memberId));
    }

    public void RemoveParticipant(Guid memberId)
    {
        var participant = _participants.FirstOrDefault(p => p.MemberId == memberId);
        if (participant != null)
        {
            _participants.Remove(participant);
        }
    }

    public void ClearParticipants()
    {
        _participants.Clear();
    }

    public void SetParticipants(IEnumerable<SetlistItemParticipant> participants)
    {
        _participants.Clear();
        _participants.AddRange(participants);
    }
}
