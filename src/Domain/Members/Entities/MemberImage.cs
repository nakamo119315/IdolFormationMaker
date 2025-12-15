namespace IdolManagement.Domain.Members.Entities;

public class MemberImage
{
    public Guid Id { get; private set; }
    public Guid MemberId { get; private set; }
    public string Url { get; private set; } = string.Empty;
    public bool IsPrimary { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private MemberImage() { }

    public static MemberImage Create(Guid memberId, string url, bool isPrimary = false)
    {
        if (string.IsNullOrWhiteSpace(url))
            throw new ArgumentException("Url is required.", nameof(url));

        return new MemberImage
        {
            Id = Guid.NewGuid(),
            MemberId = memberId,
            Url = url,
            IsPrimary = isPrimary,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void SetPrimary(bool isPrimary)
    {
        IsPrimary = isPrimary;
    }
}
