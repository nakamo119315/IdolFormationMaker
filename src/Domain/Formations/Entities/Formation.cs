using IdolManagement.Domain.Shared.Interfaces;

namespace IdolManagement.Domain.Formations.Entities;

public class Formation : IEntity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public Guid GroupId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private readonly List<FormationPosition> _positions = new();
    public IReadOnlyCollection<FormationPosition> Positions => _positions.AsReadOnly();

    private Formation() { }

    public static Formation Create(string name, Guid groupId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        if (groupId == Guid.Empty)
            throw new ArgumentException("GroupId is required.", nameof(groupId));

        var now = DateTime.UtcNow;
        return new Formation
        {
            Id = Guid.NewGuid(),
            Name = name,
            GroupId = groupId,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void Update(string name, Guid groupId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        if (groupId == Guid.Empty)
            throw new ArgumentException("GroupId is required.", nameof(groupId));

        Name = name;
        GroupId = groupId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPositions(IEnumerable<FormationPosition> positions)
    {
        _positions.Clear();
        _positions.AddRange(positions);
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddPosition(FormationPosition position)
    {
        _positions.Add(position);
        UpdatedAt = DateTime.UtcNow;
    }

    public void ClearPositions()
    {
        _positions.Clear();
        UpdatedAt = DateTime.UtcNow;
    }
}
