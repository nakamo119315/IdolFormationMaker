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
        member.Update(newName, newBirthDate, null, null, null, newGroupId, null, false, null, null);

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

    [Fact]
    public void Create_WithGeneration_ShouldSetGeneration()
    {
        // Arrange
        var name = "Test Member";
        var birthDate = new DateOnly(2000, 1, 15);
        var generation = 4;

        // Act
        var member = Member.Create(name, birthDate, generation: generation);

        // Assert
        Assert.Equal(generation, member.Generation);
        Assert.False(member.IsGraduated);
    }

    [Fact]
    public void Create_WithIsGraduated_ShouldSetIsGraduated()
    {
        // Arrange
        var name = "Test Member";
        var birthDate = new DateOnly(2000, 1, 15);

        // Act
        var member = Member.Create(name, birthDate, isGraduated: true);

        // Assert
        Assert.True(member.IsGraduated);
    }

    [Fact]
    public void Update_WithGenerationAndIsGraduated_ShouldUpdateBothFields()
    {
        // Arrange
        var member = Member.Create("Original Name", new DateOnly(2000, 1, 15), generation: 3);
        Assert.Equal(3, member.Generation);
        Assert.False(member.IsGraduated);

        // Act
        member.Update("Updated Name", new DateOnly(2000, 1, 15), null, null, null, null, 4, true, null, null);

        // Assert
        Assert.Equal(4, member.Generation);
        Assert.True(member.IsGraduated);
    }

    [Fact]
    public void Create_WithoutGeneration_ShouldHaveNullGeneration()
    {
        // Arrange & Act
        var member = Member.Create("Test Member", new DateOnly(2000, 1, 15));

        // Assert
        Assert.Null(member.Generation);
    }

    #region 品質テスト - 不変条件

    [Fact]
    public void Create_ShouldGenerateUniqueIds()
    {
        // Arrange & Act
        var members = Enumerable.Range(0, 100)
            .Select(_ => Member.Create("Test", new DateOnly(2000, 1, 1)))
            .ToList();

        // Assert - すべてのIDがユニークであること
        var uniqueIds = members.Select(m => m.Id).Distinct().Count();
        Assert.Equal(100, uniqueIds);
    }

    [Fact]
    public void Create_CreatedAtAndUpdatedAt_ShouldBeVeryClose()
    {
        // Arrange & Act
        var member = Member.Create("Test", new DateOnly(2000, 1, 1));

        // Assert - 作成時はCreatedAtとUpdatedAtがほぼ同時刻であること（1ms以内）
        var diff = Math.Abs((member.CreatedAt - member.UpdatedAt).TotalMilliseconds);
        Assert.True(diff < 1, $"CreatedAt and UpdatedAt should be within 1ms, but diff was {diff}ms");
    }

    [Fact]
    public void Update_CreatedAt_ShouldNotChange()
    {
        // Arrange
        var member = Member.Create("Test", new DateOnly(2000, 1, 1));
        var originalCreatedAt = member.CreatedAt;
        System.Threading.Thread.Sleep(10);

        // Act
        member.Update("Updated", new DateOnly(2001, 1, 1), null, null, null, null, null, false, null, null);

        // Assert - CreatedAtは変更されないこと
        Assert.Equal(originalCreatedAt, member.CreatedAt);
    }

    [Fact]
    public void AddImage_ShouldUpdateTimestamp()
    {
        // Arrange
        var member = Member.Create("Test", new DateOnly(2000, 1, 1));
        var originalUpdatedAt = member.UpdatedAt;
        System.Threading.Thread.Sleep(10);

        // Act
        member.AddImage(MemberImage.Create(member.Id, "https://example.com/img.jpg", false));

        // Assert
        Assert.True(member.UpdatedAt > originalUpdatedAt);
    }

    [Fact]
    public void RemoveImage_WhenImageExists_ShouldUpdateTimestamp()
    {
        // Arrange
        var member = Member.Create("Test", new DateOnly(2000, 1, 1));
        var image = MemberImage.Create(member.Id, "https://example.com/img.jpg", false);
        member.AddImage(image);
        var originalUpdatedAt = member.UpdatedAt;
        System.Threading.Thread.Sleep(10);

        // Act
        member.RemoveImage(image.Id);

        // Assert
        Assert.True(member.UpdatedAt > originalUpdatedAt);
    }

    [Fact]
    public void RemoveImage_WhenImageNotExists_ShouldNotUpdateTimestamp()
    {
        // Arrange
        var member = Member.Create("Test", new DateOnly(2000, 1, 1));
        var originalUpdatedAt = member.UpdatedAt;

        // Act
        member.RemoveImage(Guid.NewGuid());

        // Assert - 存在しない画像の削除ではタイムスタンプは更新されない
        Assert.Equal(originalUpdatedAt, member.UpdatedAt);
    }

    #endregion

    #region 品質テスト - 境界値

    [Theory]
    [InlineData(1)]
    [InlineData(99)]
    public void Create_WithValidGeneration_ShouldSucceed(int generation)
    {
        // Arrange & Act
        var member = Member.Create("Test", new DateOnly(2000, 1, 1), generation: generation);

        // Assert
        Assert.Equal(generation, member.Generation);
    }

    [Fact]
    public void Create_WithFutureBirthDate_ShouldSucceed()
    {
        // ドメインルールとして未来の生年月日を許可するかは要件次第
        // 現在の実装では許可しているのでテストで確認
        var futureBirthDate = DateOnly.FromDateTime(DateTime.Today.AddYears(1));
        var member = Member.Create("Test", futureBirthDate);

        Assert.Equal(futureBirthDate, member.BirthDate);
    }

    [Fact]
    public void Create_WithVeryOldBirthDate_ShouldSucceed()
    {
        // 極端に古い日付もドメインとして許可
        var oldBirthDate = new DateOnly(1900, 1, 1);
        var member = Member.Create("Test", oldBirthDate);

        Assert.Equal(oldBirthDate, member.BirthDate);
    }

    [Fact]
    public void Create_WithVeryLongName_ShouldSucceed()
    {
        // 長い名前のテスト
        var longName = new string('あ', 1000);
        var member = Member.Create(longName, new DateOnly(2000, 1, 1));

        Assert.Equal(longName, member.Name);
    }

    [Fact]
    public void Create_WithSpecialCharactersInName_ShouldSucceed()
    {
        // 特殊文字を含む名前
        var specialName = "山田☆太郎 (Jr.)【公式】";
        var member = Member.Create(specialName, new DateOnly(2000, 1, 1));

        Assert.Equal(specialName, member.Name);
    }

    #endregion

    #region 品質テスト - 画像コレクションの整合性

    [Fact]
    public void AddImage_MultipleTimes_ShouldAddAllImages()
    {
        // Arrange
        var member = Member.Create("Test", new DateOnly(2000, 1, 1));

        // Act
        for (int i = 0; i < 10; i++)
        {
            member.AddImage(MemberImage.Create(member.Id, $"https://example.com/img{i}.jpg", i == 0));
        }

        // Assert
        Assert.Equal(10, member.Images.Count);
    }

    [Fact]
    public void SetImages_ShouldReplaceAllImages()
    {
        // Arrange
        var member = Member.Create("Test", new DateOnly(2000, 1, 1));
        member.AddImage(MemberImage.Create(member.Id, "https://example.com/old.jpg", true));
        var newImages = new[]
        {
            MemberImage.Create(member.Id, "https://example.com/new1.jpg", true),
            MemberImage.Create(member.Id, "https://example.com/new2.jpg", false)
        };

        // Act
        member.SetImages(newImages);

        // Assert
        Assert.Equal(2, member.Images.Count);
        Assert.All(member.Images, img => Assert.StartsWith("https://example.com/new", img.Url));
    }

    [Fact]
    public void Images_ShouldBeReadOnly()
    {
        // Arrange
        var member = Member.Create("Test", new DateOnly(2000, 1, 1));
        member.AddImage(MemberImage.Create(member.Id, "https://example.com/img.jpg", true));

        // Assert - IReadOnlyCollectionなので直接変更できない
        Assert.IsAssignableFrom<IReadOnlyCollection<MemberImage>>(member.Images);
    }

    #endregion

    #region 品質テスト - Update異常系

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Update_WithInvalidName_ShouldThrowArgumentException(string? invalidName)
    {
        // Arrange
        var member = Member.Create("Original", new DateOnly(2000, 1, 1));

        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            member.Update(invalidName!, new DateOnly(2000, 1, 1), null, null, null, null, null, false, null, null));
    }

    [Fact]
    public void Update_WithInvalidName_ShouldNotModifyOriginalData()
    {
        // Arrange
        var member = Member.Create("Original", new DateOnly(2000, 1, 1));
        var originalName = member.Name;

        // Act
        try { member.Update("", new DateOnly(2000, 1, 1), null, null, null, null, null, false, null, null); }
        catch { /* expected */ }

        // Assert - 元のデータは変更されていない
        Assert.Equal(originalName, member.Name);
    }

    #endregion
}
