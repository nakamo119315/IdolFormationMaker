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

    #region 品質テスト - 不変条件

    [Fact]
    public void Create_ShouldGenerateUniqueIds()
    {
        // Arrange & Act
        var setlists = Enumerable.Range(0, 100)
            .Select(_ => Setlist.Create("Test", Guid.NewGuid()))
            .ToList();

        // Assert
        var uniqueIds = setlists.Select(s => s.Id).Distinct().Count();
        Assert.Equal(100, uniqueIds);
    }

    [Fact]
    public void Create_CreatedAtAndUpdatedAt_ShouldBeVeryClose()
    {
        // Arrange & Act
        var setlist = Setlist.Create("Test", Guid.NewGuid());

        // Assert - 作成時はCreatedAtとUpdatedAtがほぼ同時刻であること（1ms以内）
        var diff = Math.Abs((setlist.CreatedAt - setlist.UpdatedAt).TotalMilliseconds);
        Assert.True(diff < 1, $"CreatedAt and UpdatedAt should be within 1ms, but diff was {diff}ms");
    }

    [Fact]
    public void Update_CreatedAt_ShouldNotChange()
    {
        // Arrange
        var setlist = Setlist.Create("Original", Guid.NewGuid());
        var originalCreatedAt = setlist.CreatedAt;
        System.Threading.Thread.Sleep(10);

        // Act
        setlist.Update("Updated", new DateOnly(2025, 1, 1));

        // Assert
        Assert.Equal(originalCreatedAt, setlist.CreatedAt);
    }

    [Fact]
    public void AddItem_ShouldUpdateTimestamp()
    {
        // Arrange
        var setlist = Setlist.Create("Test", Guid.NewGuid());
        var originalUpdatedAt = setlist.UpdatedAt;
        System.Threading.Thread.Sleep(10);

        // Act
        setlist.AddItem(Guid.NewGuid(), 1);

        // Assert
        Assert.True(setlist.UpdatedAt > originalUpdatedAt);
    }

    [Fact]
    public void RemoveItem_WhenItemExists_ShouldUpdateTimestamp()
    {
        // Arrange
        var setlist = Setlist.Create("Test", Guid.NewGuid());
        var item = setlist.AddItem(Guid.NewGuid(), 1);
        var originalUpdatedAt = setlist.UpdatedAt;
        System.Threading.Thread.Sleep(10);

        // Act
        setlist.RemoveItem(item.Id);

        // Assert
        Assert.True(setlist.UpdatedAt > originalUpdatedAt);
    }

    [Fact]
    public void RemoveItem_WhenItemNotExists_ShouldNotUpdateTimestamp()
    {
        // Arrange
        var setlist = Setlist.Create("Test", Guid.NewGuid());
        setlist.AddItem(Guid.NewGuid(), 1);
        var originalUpdatedAt = setlist.UpdatedAt;

        // Act
        setlist.RemoveItem(Guid.NewGuid());

        // Assert
        Assert.Equal(originalUpdatedAt, setlist.UpdatedAt);
    }

    #endregion

    #region 品質テスト - ビジネスルール

    [Fact]
    public void AddItem_DuplicateOrder_ShouldAllow()
    {
        // ビジネスルール確認: 同一Orderの重複は許可されるか？
        // 現在の実装では許可している
        var setlist = Setlist.Create("Test", Guid.NewGuid());

        setlist.AddItem(Guid.NewGuid(), 1);
        setlist.AddItem(Guid.NewGuid(), 1);

        Assert.Equal(2, setlist.Items.Count);
    }

    [Fact]
    public void AddItem_SameSongMultipleTimes_ShouldAllow()
    {
        // ビジネスルール確認: 同一曲を複数回追加（アンコールなど）は許可されるか？
        // 現在の実装では許可している
        var setlist = Setlist.Create("Test", Guid.NewGuid());
        var songId = Guid.NewGuid();

        setlist.AddItem(songId, 1);
        setlist.AddItem(songId, 10); // アンコールで再度

        Assert.Equal(2, setlist.Items.Count);
    }

    [Fact]
    public void AddItem_WithZeroOrder_ShouldThrowArgumentException()
    {
        // Arrange
        var setlist = Setlist.Create("Test", Guid.NewGuid());

        // Act & Assert - SetlistItem.Createで例外が発生する
        Assert.Throws<ArgumentException>(() => setlist.AddItem(Guid.NewGuid(), 0));
    }

    [Fact]
    public void AddItem_WithNegativeOrder_ShouldThrowArgumentException()
    {
        // Arrange
        var setlist = Setlist.Create("Test", Guid.NewGuid());

        // Act & Assert
        Assert.Throws<ArgumentException>(() => setlist.AddItem(Guid.NewGuid(), -1));
    }

    [Fact]
    public void AddItem_WithEmptySongId_ShouldThrowArgumentException()
    {
        // Arrange
        var setlist = Setlist.Create("Test", Guid.NewGuid());

        // Act & Assert
        Assert.Throws<ArgumentException>(() => setlist.AddItem(Guid.Empty, 1));
    }

    #endregion

    #region 品質テスト - 異常系

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Update_WithInvalidName_ShouldThrowArgumentException(string? invalidName)
    {
        // Arrange
        var setlist = Setlist.Create("Original", Guid.NewGuid());

        // Act & Assert
        Assert.Throws<ArgumentException>(() => setlist.Update(invalidName!, null));
    }

    [Fact]
    public void ClearItems_OnEmptySetlist_ShouldNotThrow()
    {
        // Arrange
        var setlist = Setlist.Create("Test", Guid.NewGuid());

        // Act & Assert
        var exception = Record.Exception(() => setlist.ClearItems());
        Assert.Null(exception);
        Assert.Empty(setlist.Items);
    }

    #endregion

    #region 品質テスト - 境界値

    [Fact]
    public void Create_WithFutureEventDate_ShouldSucceed()
    {
        // 未来のイベント日付は許可される
        var futureDate = DateOnly.FromDateTime(DateTime.Today.AddYears(1));
        var setlist = Setlist.Create("Future Event", Guid.NewGuid(), futureDate);

        Assert.Equal(futureDate, setlist.EventDate);
    }

    [Fact]
    public void Create_WithPastEventDate_ShouldSucceed()
    {
        // 過去のイベント日付も許可される（記録目的）
        var pastDate = new DateOnly(2010, 1, 1);
        var setlist = Setlist.Create("Past Event", Guid.NewGuid(), pastDate);

        Assert.Equal(pastDate, setlist.EventDate);
    }

    [Fact]
    public void AddItem_LargeOrderNumber_ShouldSucceed()
    {
        // 大きなOrder番号も許可される
        var setlist = Setlist.Create("Test", Guid.NewGuid());
        var item = setlist.AddItem(Guid.NewGuid(), 1000);

        Assert.Equal(1000, item.Order);
    }

    [Fact]
    public void AddItem_ManyItems_ShouldSucceed()
    {
        // 多数のアイテム追加
        var setlist = Setlist.Create("Test", Guid.NewGuid());

        for (int i = 1; i <= 50; i++)
        {
            setlist.AddItem(Guid.NewGuid(), i);
        }

        Assert.Equal(50, setlist.Items.Count);
    }

    #endregion
}
