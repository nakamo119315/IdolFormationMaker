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

    #region 品質テスト - 不変条件とビジネスルール

    [Fact]
    public void Create_ShouldGenerateUniqueIds()
    {
        // Arrange & Act
        var items = Enumerable.Range(0, 100)
            .Select(_ => SetlistItem.Create(Guid.NewGuid(), Guid.NewGuid(), 1))
            .ToList();

        // Assert
        var uniqueIds = items.Select(i => i.Id).Distinct().Count();
        Assert.Equal(100, uniqueIds);
    }

    [Fact]
    public void AddParticipant_MultipleDifferentMembers_ShouldAddAll()
    {
        // Arrange
        var item = SetlistItem.Create(Guid.NewGuid(), Guid.NewGuid(), 1);

        // Act
        for (int i = 0; i < 20; i++)
        {
            item.AddParticipant(Guid.NewGuid());
        }

        // Assert
        Assert.Equal(20, item.Participants.Count);
    }

    [Fact]
    public void ClearParticipants_OnEmptyList_ShouldNotThrow()
    {
        // Arrange
        var item = SetlistItem.Create(Guid.NewGuid(), Guid.NewGuid(), 1);

        // Act & Assert
        var exception = Record.Exception(() => item.ClearParticipants());
        Assert.Null(exception);
        Assert.Empty(item.Participants);
    }

    [Fact]
    public void AddParticipant_AfterClear_ShouldAddNewParticipants()
    {
        // Arrange
        var item = SetlistItem.Create(Guid.NewGuid(), Guid.NewGuid(), 1);
        item.AddParticipant(Guid.NewGuid());
        item.ClearParticipants();

        // Act
        var newMemberId = Guid.NewGuid();
        item.AddParticipant(newMemberId);

        // Assert
        Assert.Single(item.Participants);
        Assert.Equal(newMemberId, item.Participants.First().MemberId);
    }

    [Fact]
    public void Update_ShouldNotChangeSetlistId()
    {
        // Arrange
        var originalSetlistId = Guid.NewGuid();
        var item = SetlistItem.Create(originalSetlistId, Guid.NewGuid(), 1);

        // Act
        item.Update(5, Guid.NewGuid());

        // Assert - SetlistIdは変更されない
        Assert.Equal(originalSetlistId, item.SetlistId);
    }

    [Fact]
    public void Update_ShouldNotChangeSongId()
    {
        // Arrange
        var originalSongId = Guid.NewGuid();
        var item = SetlistItem.Create(Guid.NewGuid(), originalSongId, 1);

        // Act
        item.Update(5, Guid.NewGuid());

        // Assert - SongIdは変更されない
        Assert.Equal(originalSongId, item.SongId);
    }

    [Fact]
    public void Update_WithNullCenter_ShouldClearCenter()
    {
        // Arrange
        var item = SetlistItem.Create(Guid.NewGuid(), Guid.NewGuid(), 1, Guid.NewGuid());
        Assert.NotNull(item.CenterMemberId);

        // Act
        item.Update(2, null);

        // Assert
        Assert.Null(item.CenterMemberId);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(int.MaxValue)]
    public void Create_WithValidOrderBoundary_ShouldSucceed(int order)
    {
        // Arrange & Act
        var item = SetlistItem.Create(Guid.NewGuid(), Guid.NewGuid(), order);

        // Assert
        Assert.Equal(order, item.Order);
    }

    [Fact]
    public void Update_WithInvalidOrder_ShouldNotModifyOriginalData()
    {
        // Arrange
        var item = SetlistItem.Create(Guid.NewGuid(), Guid.NewGuid(), 5, Guid.NewGuid());
        var originalOrder = item.Order;
        var originalCenter = item.CenterMemberId;

        // Act
        try { item.Update(0, Guid.NewGuid()); }
        catch { /* expected */ }

        // Assert - 元のデータは変更されていない
        Assert.Equal(originalOrder, item.Order);
        Assert.Equal(originalCenter, item.CenterMemberId);
    }

    #endregion
}
