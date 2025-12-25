using IdolManagement.Domain.Shared.Interfaces;

namespace IdolManagement.Domain.Members.Entities;

public class Member : IEntity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public DateOnly BirthDate { get; private set; }
    public string? Birthplace { get; private set; }
    public string? PenLightColor1 { get; private set; }
    public string? PenLightColor2 { get; private set; }
    public Guid? GroupId { get; private set; }
    public int? Generation { get; private set; }
    public bool IsGraduated { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private readonly List<MemberImage> _images = new();
    public IReadOnlyCollection<MemberImage> Images => _images.AsReadOnly();

    private Member() { }

    public static Member Create(string name, DateOnly birthDate, string? birthplace = null, string? penLightColor1 = null, string? penLightColor2 = null, Guid? groupId = null, int? generation = null, bool isGraduated = false)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        var now = DateTime.UtcNow;
        return new Member
        {
            Id = Guid.NewGuid(),
            Name = name,
            BirthDate = birthDate,
            Birthplace = birthplace,
            PenLightColor1 = penLightColor1,
            PenLightColor2 = penLightColor2,
            GroupId = groupId,
            Generation = generation,
            IsGraduated = isGraduated,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void Update(string name, DateOnly birthDate, string? birthplace, string? penLightColor1, string? penLightColor2, Guid? groupId, int? generation, bool isGraduated)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        Name = name;
        BirthDate = birthDate;
        Birthplace = birthplace;
        PenLightColor1 = penLightColor1;
        PenLightColor2 = penLightColor2;
        GroupId = groupId;
        Generation = generation;
        IsGraduated = isGraduated;
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
