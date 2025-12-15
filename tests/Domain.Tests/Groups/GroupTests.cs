using IdolManagement.Domain.Groups.Entities;

namespace IdolManagement.Domain.Tests.Groups;

public class GroupTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateGroup()
    {
        // Arrange
        var name = "Test Group";
        var debutDate = new DateOnly(2020, 5, 1);

        // Act
        var group = Group.Create(name, debutDate);

        // Assert
        Assert.NotEqual(Guid.Empty, group.Id);
        Assert.Equal(name, group.Name);
        Assert.Equal(debutDate, group.DebutDate);
        Assert.Empty(group.Members);
        Assert.True(group.CreatedAt <= DateTime.UtcNow);
        Assert.True(group.UpdatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public void Create_WithoutDebutDate_ShouldCreateGroupWithNullDebutDate()
    {
        // Arrange
        var name = "Test Group";

        // Act
        var group = Group.Create(name);

        // Assert
        Assert.Null(group.DebutDate);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidName_ShouldThrowArgumentException(string? name)
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() => Group.Create(name!));
    }

    [Fact]
    public void Update_WithValidData_ShouldUpdateGroup()
    {
        // Arrange
        var group = Group.Create("Original Name", new DateOnly(2020, 1, 1));
        var originalUpdatedAt = group.UpdatedAt;
        var newName = "Updated Name";
        var newDebutDate = new DateOnly(2021, 6, 15);

        // Wait a bit to ensure UpdatedAt changes
        System.Threading.Thread.Sleep(10);

        // Act
        group.Update(newName, newDebutDate);

        // Assert
        Assert.Equal(newName, group.Name);
        Assert.Equal(newDebutDate, group.DebutDate);
        Assert.True(group.UpdatedAt > originalUpdatedAt);
    }

    [Fact]
    public void Update_WithNullDebutDate_ShouldUpdateToNull()
    {
        // Arrange
        var group = Group.Create("Test Group", new DateOnly(2020, 1, 1));

        // Act
        group.Update("Updated Name", null);

        // Assert
        Assert.Null(group.DebutDate);
    }
}
