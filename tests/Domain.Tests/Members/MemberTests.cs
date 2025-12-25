using IdolManagement.Domain.Members.Entities;

namespace IdolManagement.Domain.Tests.Members;

public class MemberTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateMember()
    {
        // Arrange
        var name = "Test Member";
        var birthDate = new DateOnly(2000, 1, 15);
        var birthplace = "東京都";
        var penLightColor1 = "ピンク";
        var penLightColor2 = "白";
        var groupId = Guid.NewGuid();

        // Act
        var member = Member.Create(name, birthDate, birthplace, penLightColor1, penLightColor2, groupId);

        // Assert
        Assert.NotEqual(Guid.Empty, member.Id);
        Assert.Equal(name, member.Name);
        Assert.Equal(birthDate, member.BirthDate);
        Assert.Equal(birthplace, member.Birthplace);
        Assert.Equal(penLightColor1, member.PenLightColor1);
        Assert.Equal(penLightColor2, member.PenLightColor2);
        Assert.Equal(groupId, member.GroupId);
        Assert.Empty(member.Images);
        Assert.True(member.CreatedAt <= DateTime.UtcNow);
        Assert.True(member.UpdatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public void Create_WithNullGroupId_ShouldCreateMemberWithoutGroup()
    {
        // Arrange
        var name = "Test Member";
        var birthDate = new DateOnly(2000, 1, 15);

        // Act
        var member = Member.Create(name, birthDate);

        // Assert
        Assert.Null(member.GroupId);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidName_ShouldThrowArgumentException(string? name)
    {
        // Arrange
        var birthDate = new DateOnly(2000, 1, 15);

        // Act & Assert
        Assert.Throws<ArgumentException>(() => Member.Create(name!, birthDate));
    }

    [Fact]
    public void Update_WithValidData_ShouldUpdateMember()
    {
        // Arrange
        var member = Member.Create("Original Name", new DateOnly(2000, 1, 15));
        var originalUpdatedAt = member.UpdatedAt;
        var newName = "Updated Name";
        var newBirthDate = new DateOnly(2001, 6, 20);
        var newGroupId = Guid.NewGuid();

        // Wait a bit to ensure UpdatedAt changes
        System.Threading.Thread.Sleep(10);

        // Act
        member.Update(newName, newBirthDate, null, null, null, newGroupId, null, false);

        // Assert
        Assert.Equal(newName, member.Name);
        Assert.Equal(newBirthDate, member.BirthDate);
        Assert.Equal(newGroupId, member.GroupId);
        Assert.True(member.UpdatedAt > originalUpdatedAt);
    }

    [Fact]
    public void AddImage_ShouldAddImageToCollection()
    {
        // Arrange
        var member = Member.Create("Test Member", new DateOnly(2000, 1, 15));
        var image = MemberImage.Create(member.Id, "https://example.com/image.jpg", true);

        // Act
        member.AddImage(image);

        // Assert
        Assert.Single(member.Images);
        Assert.Contains(image, member.Images);
    }

    [Fact]
    public void RemoveImage_WithExistingImage_ShouldRemoveFromCollection()
    {
        // Arrange
        var member = Member.Create("Test Member", new DateOnly(2000, 1, 15));
        var image = MemberImage.Create(member.Id, "https://example.com/image.jpg", true);
        member.AddImage(image);

        // Act
        member.RemoveImage(image.Id);

        // Assert
        Assert.Empty(member.Images);
    }

    [Fact]
    public void RemoveImage_WithNonExistingImage_ShouldDoNothing()
    {
        // Arrange
        var member = Member.Create("Test Member", new DateOnly(2000, 1, 15));
        var image = MemberImage.Create(member.Id, "https://example.com/image.jpg", true);
        member.AddImage(image);

        // Act
        member.RemoveImage(Guid.NewGuid());

        // Assert
        Assert.Single(member.Images);
    }
}
