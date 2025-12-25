namespace IdolManagement.Domain.Setlists.Entities;

public class SetlistItemParticipant
{
    public Guid Id { get; private set; }
    public Guid SetlistItemId { get; private set; }
    public Guid MemberId { get; private set; }

    private SetlistItemParticipant() { }

    public static SetlistItemParticipant Create(Guid setlistItemId, Guid memberId)
    {
        if (setlistItemId == Guid.Empty)
            throw new ArgumentException("SetlistItemId cannot be empty", nameof(setlistItemId));
        if (memberId == Guid.Empty)
            throw new ArgumentException("MemberId cannot be empty", nameof(memberId));

        return new SetlistItemParticipant
        {
            Id = Guid.NewGuid(),
            SetlistItemId = setlistItemId,
            MemberId = memberId
        };
    }
}
