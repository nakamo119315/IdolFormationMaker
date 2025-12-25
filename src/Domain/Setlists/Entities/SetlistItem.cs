namespace IdolManagement.Domain.Setlists.Entities;

public class SetlistItem
{
    public Guid Id { get; private set; }
    public Guid SetlistId { get; private set; }
    public Guid SongId { get; private set; }
    public int Order { get; private set; }
    public Guid? CenterMemberId { get; private set; }
    public List<SetlistItemParticipant> Participants { get; private set; } = new();

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

        if (Participants.Any(p => p.MemberId == memberId))
            return;

        Participants.Add(SetlistItemParticipant.Create(Id, memberId));
    }

    public void ClearParticipants()
    {
        Participants.Clear();
    }
}
