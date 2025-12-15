using IdolManagement.Domain.Members.Entities;
using IdolManagement.Domain.Shared.Interfaces;

namespace IdolManagement.Domain.Groups.Entities;

public class Group : IEntity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public DateOnly? DebutDate { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private readonly List<Member> _members = new();
    public IReadOnlyCollection<Member> Members => _members.AsReadOnly();

    private Group() { }

    public static Group Create(string name, DateOnly? debutDate = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        var now = DateTime.UtcNow;
        return new Group
        {
            Id = Guid.NewGuid(),
            Name = name,
            DebutDate = debutDate,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void Update(string name, DateOnly? debutDate)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        Name = name;
        DebutDate = debutDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetMembers(IEnumerable<Member> members)
    {
        _members.Clear();
        _members.AddRange(members);
    }
}
