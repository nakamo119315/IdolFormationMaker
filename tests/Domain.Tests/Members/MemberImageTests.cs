using IdolManagement.Domain.Members.Entities;

namespace IdolManagement.Domain.Tests.Members;

public class MemberImageTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateMemberImage()
    {
        // Arrange
        var memberId = Guid.NewGuid();
        var url = "https://example.com/image.jpg";
        var isPrimary = true;

        // Act
        var image = MemberImage.Create(memberId, url, isPrimary);

        // Assert
        Assert.NotEqual(Guid.Empty, image.Id);
        Assert.Equal(memberId, image.MemberId);
        Assert.Equal(url, image.Url);
        Assert.True(image.IsPrimary);
        Assert.True(image.CreatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public void Create_WithDefaultIsPrimary_ShouldBeNotPrimary()
    {
        // Arrange
        var memberId = Guid.NewGuid();
        var url = "https://example.com/image.jpg";

        // Act
        var image = MemberImage.Create(memberId, url);

        // Assert
        Assert.False(image.IsPrimary);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidUrl_ShouldThrowArgumentException(string? url)
    {
        // Arrange
        var memberId = Guid.NewGuid();

        // Act & Assert
        Assert.Throws<ArgumentException>(() => MemberImage.Create(memberId, url!));
    }

    [Fact]
    public void SetPrimary_ShouldUpdateIsPrimaryFlag()
    {
        // Arrange
        var image = MemberImage.Create(Guid.NewGuid(), "https://example.com/image.jpg", false);

        // Act
        image.SetPrimary(true);

        // Assert
        Assert.True(image.IsPrimary);

        // Act
        image.SetPrimary(false);

        // Assert
        Assert.False(image.IsPrimary);
    }
}
