using IdolManagement.Domain.Setlists.Entities;

namespace IdolManagement.Domain.Tests.Setlists;

public class SetlistItemTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateSetlistItem()
    {
        // Arrange
        var setlistId = Guid.NewGuid();
        var songId = Guid.NewGuid();
        var order = 1;
        var centerId = Guid.NewGuid();

        // Act
        var item = SetlistItem.Create(setlistId, songId, order, centerId);

        // Assert
        Assert.NotEqual(Guid.Empty, item.Id);
        Assert.Equal(setlistId, item.SetlistId);
        Assert.Equal(songId, item.SongId);
        Assert.Equal(order, item.Order);
        Assert.Equal(centerId, item.CenterMemberId);
        Assert.Empty(item.Participants);
    }

    [Fact]
    public void Create_WithoutCenterMemberId_ShouldCreateWithNullCenter()
    {
        // Arrange
        var setlistId = Guid.NewGuid();
        var songId = Guid.NewGuid();

        // Act
        var item = SetlistItem.Create(setlistId, songId, 1);

        // Assert
        Assert.Null(item.CenterMemberId);
    }

    [Fact]
    public void Create_WithEmptySetlistId_ShouldThrowArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() => SetlistItem.Create(Guid.Empty, Guid.NewGuid(), 1));
    }

    [Fact]
    public void Create_WithEmptySongId_ShouldThrowArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() => SetlistItem.Create(Guid.NewGuid(), Guid.Empty, 1));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-100)]
    public void Create_WithInvalidOrder_ShouldThrowArgumentException(int order)
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() => SetlistItem.Create(Guid.NewGuid(), Guid.NewGuid(), order));
    }

    [Fact]
    public void Update_WithValidData_ShouldUpdateItem()
    {
        // Arrange
        var item = SetlistItem.Create(Guid.NewGuid(), Guid.NewGuid(), 1);
        var newCenterId = Guid.NewGuid();

        // Act
        item.Update(5, newCenterId);

        // Assert
        Assert.Equal(5, item.Order);
        Assert.Equal(newCenterId, item.CenterMemberId);
    }

    [Fact]
    public void Update_WithInvalidOrder_ShouldThrowArgumentException()
    {
        // Arrange
        var item = SetlistItem.Create(Guid.NewGuid(), Guid.NewGuid(), 1);

        // Act & Assert
        Assert.Throws<ArgumentException>(() => item.Update(0, null));
    }

    [Fact]
    public void AddParticipant_ShouldAddToParticipants()
    {
        // Arrange
        var item = SetlistItem.Create(Guid.NewGuid(), Guid.NewGuid(), 1);
        var memberId = Guid.NewGuid();

        // Act
        item.AddParticipant(memberId);

        // Assert
        Assert.Single(item.Participants);
        Assert.Equal(memberId, item.Participants.First().MemberId);
    }

    [Fact]
    public void AddParticipant_WithDuplicateMember_ShouldNotAddTwice()
    {
        // Arrange
        var item = SetlistItem.Create(Guid.NewGuid(), Guid.NewGuid(), 1);
        var memberId = Guid.NewGuid();

        // Act
        item.AddParticipant(memberId);
        item.AddParticipant(memberId);

        // Assert
        Assert.Single(item.Participants);
    }

    [Fact]
    public void AddParticipant_WithEmptyMemberId_ShouldThrowArgumentException()
    {
        // Arrange
        var item = SetlistItem.Create(Guid.NewGuid(), Guid.NewGuid(), 1);

        // Act & Assert
        Assert.Throws<ArgumentException>(() => item.AddParticipant(Guid.Empty));
    }

    [Fact]
    public void ClearParticipants_ShouldRemoveAllParticipants()
    {
        // Arrange
        var item = SetlistItem.Create(Guid.NewGuid(), Guid.NewGuid(), 1);
        item.AddParticipant(Guid.NewGuid());
        item.AddParticipant(Guid.NewGuid());
        item.AddParticipant(Guid.NewGuid());

        // Act
        item.ClearParticipants();

        // Assert
        Assert.Empty(item.Participants);
    }
}
