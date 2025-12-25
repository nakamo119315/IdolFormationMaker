using IdolManagement.Domain.Setlists.Entities;

namespace IdolManagement.Domain.Tests.Setlists;

public class SetlistTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateSetlist()
    {
        // Arrange
        var name = "Test Setlist";
        var groupId = Guid.NewGuid();
        var eventDate = new DateOnly(2024, 12, 25);

        // Act
        var setlist = Setlist.Create(name, groupId, eventDate);

        // Assert
        Assert.NotEqual(Guid.Empty, setlist.Id);
        Assert.Equal(name, setlist.Name);
        Assert.Equal(groupId, setlist.GroupId);
        Assert.Equal(eventDate, setlist.EventDate);
        Assert.Empty(setlist.Items);
        Assert.True(setlist.CreatedAt <= DateTime.UtcNow);
        Assert.True(setlist.UpdatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public void Create_WithoutEventDate_ShouldCreateSetlistWithNullEventDate()
    {
        // Arrange
        var name = "Test Setlist";
        var groupId = Guid.NewGuid();

        // Act
        var setlist = Setlist.Create(name, groupId);

        // Assert
        Assert.Null(setlist.EventDate);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidName_ShouldThrowArgumentException(string? name)
    {
        // Arrange
        var groupId = Guid.NewGuid();

        // Act & Assert
        Assert.Throws<ArgumentException>(() => Setlist.Create(name!, groupId));
    }

    [Fact]
    public void Create_WithEmptyGroupId_ShouldThrowArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() => Setlist.Create("Test", Guid.Empty));
    }

    [Fact]
    public void Update_WithValidData_ShouldUpdateSetlist()
    {
        // Arrange
        var setlist = Setlist.Create("Original", Guid.NewGuid());
        var originalUpdatedAt = setlist.UpdatedAt;
        var newEventDate = new DateOnly(2025, 1, 1);

        System.Threading.Thread.Sleep(10);

        // Act
        setlist.Update("Updated Name", newEventDate);

        // Assert
        Assert.Equal("Updated Name", setlist.Name);
        Assert.Equal(newEventDate, setlist.EventDate);
        Assert.True(setlist.UpdatedAt > originalUpdatedAt);
    }

    [Fact]
    public void AddItem_ShouldAddItemToSetlist()
    {
        // Arrange
        var setlist = Setlist.Create("Test Setlist", Guid.NewGuid());
        var songId = Guid.NewGuid();
        var centerId = Guid.NewGuid();

        // Act
        var item = setlist.AddItem(songId, 1, centerId);

        // Assert
        Assert.Single(setlist.Items);
        Assert.Equal(songId, item.SongId);
        Assert.Equal(1, item.Order);
        Assert.Equal(centerId, item.CenterMemberId);
    }

    [Fact]
    public void AddItem_MultipleTimes_ShouldAddMultipleItems()
    {
        // Arrange
        var setlist = Setlist.Create("Test Setlist", Guid.NewGuid());

        // Act
        setlist.AddItem(Guid.NewGuid(), 1);
        setlist.AddItem(Guid.NewGuid(), 2);
        setlist.AddItem(Guid.NewGuid(), 3);

        // Assert
        Assert.Equal(3, setlist.Items.Count);
    }

    [Fact]
    public void RemoveItem_WithExistingItem_ShouldRemoveFromSetlist()
    {
        // Arrange
        var setlist = Setlist.Create("Test Setlist", Guid.NewGuid());
        var item = setlist.AddItem(Guid.NewGuid(), 1);

        // Act
        setlist.RemoveItem(item.Id);

        // Assert
        Assert.Empty(setlist.Items);
    }

    [Fact]
    public void RemoveItem_WithNonExistingItem_ShouldDoNothing()
    {
        // Arrange
        var setlist = Setlist.Create("Test Setlist", Guid.NewGuid());
        setlist.AddItem(Guid.NewGuid(), 1);

        // Act
        setlist.RemoveItem(Guid.NewGuid());

        // Assert
        Assert.Single(setlist.Items);
    }

    [Fact]
    public void ClearItems_ShouldRemoveAllItems()
    {
        // Arrange
        var setlist = Setlist.Create("Test Setlist", Guid.NewGuid());
        setlist.AddItem(Guid.NewGuid(), 1);
        setlist.AddItem(Guid.NewGuid(), 2);
        setlist.AddItem(Guid.NewGuid(), 3);

        // Act
        setlist.ClearItems();

        // Assert
        Assert.Empty(setlist.Items);
    }
}
