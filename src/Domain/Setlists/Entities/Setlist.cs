using IdolManagement.Domain.Shared.Interfaces;

namespace IdolManagement.Domain.Setlists.Entities;

public class Setlist : IEntity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public Guid GroupId { get; private set; }
    public DateOnly? EventDate { get; private set; }
    public List<SetlistItem> Items { get; private set; } = new();
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private Setlist() { }

    public static Setlist Create(
        string name,
        Guid groupId,
        DateOnly? eventDate = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty", nameof(name));
        if (groupId == Guid.Empty)
            throw new ArgumentException("GroupId cannot be empty", nameof(groupId));

        return new Setlist
        {
            Id = Guid.NewGuid(),
            Name = name,
            GroupId = groupId,
            EventDate = eventDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public void Update(string name, DateOnly? eventDate)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty", nameof(name));

        Name = name;
        EventDate = eventDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public SetlistItem AddItem(Guid songId, int order, Guid? centerMemberId = null)
    {
        var item = SetlistItem.Create(Id, songId, order, centerMemberId);
        Items.Add(item);
        UpdatedAt = DateTime.UtcNow;
        return item;
    }

    public void RemoveItem(Guid itemId)
    {
        var item = Items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            Items.Remove(item);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void ClearItems()
    {
        Items.Clear();
        UpdatedAt = DateTime.UtcNow;
    }
}
