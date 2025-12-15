using IdolManagement.Domain.Shared.Interfaces;

namespace IdolManagement.Domain.Members.Entities;

public class Member : IEntity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public DateOnly BirthDate { get; private set; }
    public Guid? GroupId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private readonly List<MemberImage> _images = new();
    public IReadOnlyCollection<MemberImage> Images => _images.AsReadOnly();

    private Member() { }

    public static Member Create(string name, DateOnly birthDate, Guid? groupId = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        var now = DateTime.UtcNow;
        return new Member
        {
            Id = Guid.NewGuid(),
            Name = name,
            BirthDate = birthDate,
            GroupId = groupId,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void Update(string name, DateOnly birthDate, Guid? groupId)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        Name = name;
        BirthDate = birthDate;
        GroupId = groupId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddImage(MemberImage image)
    {
        _images.Add(image);
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveImage(Guid imageId)
    {
        var image = _images.FirstOrDefault(i => i.Id == imageId);
        if (image != null)
        {
            _images.Remove(image);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void SetImages(IEnumerable<MemberImage> images)
    {
        _images.Clear();
        _images.AddRange(images);
    }
}
