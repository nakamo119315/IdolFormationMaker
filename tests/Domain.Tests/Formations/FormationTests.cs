using IdolManagement.Domain.Formations.Entities;

namespace IdolManagement.Domain.Tests.Formations;

public class FormationTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateFormation()
    {
        // Arrange
        var name = "Test Formation";
        var groupId = Guid.NewGuid();

        // Act
        var formation = Formation.Create(name, groupId);

        // Assert
        Assert.NotEqual(Guid.Empty, formation.Id);
        Assert.Equal(name, formation.Name);
        Assert.Equal(groupId, formation.GroupId);
        Assert.Empty(formation.Positions);
        Assert.True(formation.CreatedAt <= DateTime.UtcNow);
        Assert.True(formation.UpdatedAt <= DateTime.UtcNow);
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
        Assert.Throws<ArgumentException>(() => Formation.Create(name!, groupId));
    }

    [Fact]
    public void Create_WithEmptyGroupId_ShouldThrowArgumentException()
    {
        // Arrange
        var name = "Test Formation";

        // Act & Assert
        Assert.Throws<ArgumentException>(() => Formation.Create(name, Guid.Empty));
    }

    [Fact]
    public void Update_WithValidData_ShouldUpdateFormation()
    {
        // Arrange
        var formation = Formation.Create("Original Name", Guid.NewGuid());
        var originalUpdatedAt = formation.UpdatedAt;
        var newName = "Updated Name";
        var newGroupId = Guid.NewGuid();

        // Wait a bit to ensure UpdatedAt changes
        System.Threading.Thread.Sleep(10);

        // Act
        formation.Update(newName, newGroupId);

        // Assert
        Assert.Equal(newName, formation.Name);
        Assert.Equal(newGroupId, formation.GroupId);
        Assert.True(formation.UpdatedAt > originalUpdatedAt);
    }

    [Fact]
    public void AddPosition_ShouldAddPositionToCollection()
    {
        // Arrange
        var formation = Formation.Create("Test Formation", Guid.NewGuid());
        var position = FormationPosition.Create(formation.Id, Guid.NewGuid(), 1, 1, 1);

        // Act
        formation.AddPosition(position);

        // Assert
        Assert.Single(formation.Positions);
        Assert.Contains(position, formation.Positions);
    }

    [Fact]
    public void ClearPositions_ShouldRemoveAllPositions()
    {
        // Arrange
        var formation = Formation.Create("Test Formation", Guid.NewGuid());
        formation.AddPosition(FormationPosition.Create(formation.Id, Guid.NewGuid(), 1, 1, 1));
        formation.AddPosition(FormationPosition.Create(formation.Id, Guid.NewGuid(), 2, 1, 2));

        // Act
        formation.ClearPositions();

        // Assert
        Assert.Empty(formation.Positions);
    }
}

public class FormationPositionTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateFormationPosition()
    {
        // Arrange
        var formationId = Guid.NewGuid();
        var memberId = Guid.NewGuid();
        var positionNumber = 1;
        var row = 2;
        var column = 3;

        // Act
        var position = FormationPosition.Create(formationId, memberId, positionNumber, row, column);

        // Assert
        Assert.NotEqual(Guid.Empty, position.Id);
        Assert.Equal(formationId, position.FormationId);
        Assert.Equal(memberId, position.MemberId);
        Assert.Equal(positionNumber, position.PositionNumber);
        Assert.Equal(row, position.Row);
        Assert.Equal(column, position.Column);
    }

    [Fact]
    public void Create_WithEmptyFormationId_ShouldThrowArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            FormationPosition.Create(Guid.Empty, Guid.NewGuid(), 1, 1, 1));
    }

    [Fact]
    public void Create_WithEmptyMemberId_ShouldThrowArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            FormationPosition.Create(Guid.NewGuid(), Guid.Empty, 1, 1, 1));
    }

    [Fact]
    public void Update_ShouldUpdatePositionData()
    {
        // Arrange
        var position = FormationPosition.Create(Guid.NewGuid(), Guid.NewGuid(), 1, 1, 1);
        var newPositionNumber = 5;
        var newRow = 2;
        var newColumn = 3;

        // Act
        position.Update(newPositionNumber, newRow, newColumn);

        // Assert
        Assert.Equal(newPositionNumber, position.PositionNumber);
        Assert.Equal(newRow, position.Row);
        Assert.Equal(newColumn, position.Column);
    }

    #region 品質テスト - 境界値

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Create_WithZeroOrNegativePositionNumber_ShouldSucceed(int positionNumber)
    {
        // 現在の実装では許可しているが、ビジネスルールで制限すべきかも
        var position = FormationPosition.Create(Guid.NewGuid(), Guid.NewGuid(), positionNumber, 1, 1);
        Assert.Equal(positionNumber, position.PositionNumber);
    }

    [Theory]
    [InlineData(0, 1)]
    [InlineData(1, 0)]
    [InlineData(-1, 1)]
    [InlineData(1, -1)]
    public void Create_WithZeroOrNegativeRowColumn_ShouldSucceed(int row, int column)
    {
        // 現在の実装では許可しているが、ビジネスルールで制限すべきかも
        var position = FormationPosition.Create(Guid.NewGuid(), Guid.NewGuid(), 1, row, column);
        Assert.Equal(row, position.Row);
        Assert.Equal(column, position.Column);
    }

    [Fact]
    public void Create_WithLargePositionNumbers_ShouldSucceed()
    {
        // 大きな数値のテスト
        var position = FormationPosition.Create(Guid.NewGuid(), Guid.NewGuid(), 100, 10, 20);
        Assert.Equal(100, position.PositionNumber);
        Assert.Equal(10, position.Row);
        Assert.Equal(20, position.Column);
    }

    #endregion
}

#region Formation 品質テスト - 不変条件とビジネスルール

public class FormationQualityTests
{
    [Fact]
    public void Create_ShouldGenerateUniqueIds()
    {
        // Arrange & Act
        var formations = Enumerable.Range(0, 100)
            .Select(_ => Formation.Create("Test", Guid.NewGuid()))
            .ToList();

        // Assert
        var uniqueIds = formations.Select(f => f.Id).Distinct().Count();
        Assert.Equal(100, uniqueIds);
    }

    [Fact]
    public void AddPosition_ShouldUpdateTimestamp()
    {
        // Arrange
        var formation = Formation.Create("Test", Guid.NewGuid());
        var originalUpdatedAt = formation.UpdatedAt;
        System.Threading.Thread.Sleep(10);

        // Act
        formation.AddPosition(FormationPosition.Create(formation.Id, Guid.NewGuid(), 1, 1, 1));

        // Assert
        Assert.True(formation.UpdatedAt > originalUpdatedAt);
    }

    [Fact]
    public void ClearPositions_ShouldUpdateTimestamp()
    {
        // Arrange
        var formation = Formation.Create("Test", Guid.NewGuid());
        formation.AddPosition(FormationPosition.Create(formation.Id, Guid.NewGuid(), 1, 1, 1));
        var originalUpdatedAt = formation.UpdatedAt;
        System.Threading.Thread.Sleep(10);

        // Act
        formation.ClearPositions();

        // Assert
        Assert.True(formation.UpdatedAt > originalUpdatedAt);
    }

    [Fact]
    public void AddPosition_SameMemberMultipleTimes_ShouldAllowDuplicates()
    {
        // ビジネスルール確認: 同一メンバーの重複追加は許可されるか？
        // 現在の実装では許可している
        var formation = Formation.Create("Test", Guid.NewGuid());
        var memberId = Guid.NewGuid();

        formation.AddPosition(FormationPosition.Create(formation.Id, memberId, 1, 1, 1));
        formation.AddPosition(FormationPosition.Create(formation.Id, memberId, 2, 1, 2));

        Assert.Equal(2, formation.Positions.Count);
    }

    [Fact]
    public void AddPosition_SamePositionNumber_ShouldAllowDuplicates()
    {
        // ビジネスルール確認: 同一ポジション番号の重複は許可されるか？
        // 現在の実装では許可している
        var formation = Formation.Create("Test", Guid.NewGuid());

        formation.AddPosition(FormationPosition.Create(formation.Id, Guid.NewGuid(), 1, 1, 1));
        formation.AddPosition(FormationPosition.Create(formation.Id, Guid.NewGuid(), 1, 1, 2));

        Assert.Equal(2, formation.Positions.Count);
    }

    [Fact]
    public void AddPosition_SameRowColumn_ShouldAllowDuplicates()
    {
        // ビジネスルール確認: 同一座標の重複は許可されるか？
        // 現在の実装では許可している（複数メンバーが同じ位置にいる可能性）
        var formation = Formation.Create("Test", Guid.NewGuid());

        formation.AddPosition(FormationPosition.Create(formation.Id, Guid.NewGuid(), 1, 1, 1));
        formation.AddPosition(FormationPosition.Create(formation.Id, Guid.NewGuid(), 2, 1, 1));

        Assert.Equal(2, formation.Positions.Count);
    }

    [Fact]
    public void Positions_ShouldBeReadOnly()
    {
        // Arrange
        var formation = Formation.Create("Test", Guid.NewGuid());
        formation.AddPosition(FormationPosition.Create(formation.Id, Guid.NewGuid(), 1, 1, 1));

        // Assert
        Assert.IsAssignableFrom<IReadOnlyCollection<FormationPosition>>(formation.Positions);
    }

    [Fact]
    public void Update_CreatedAt_ShouldNotChange()
    {
        // Arrange
        var formation = Formation.Create("Original", Guid.NewGuid());
        var originalCreatedAt = formation.CreatedAt;
        System.Threading.Thread.Sleep(10);

        // Act
        formation.Update("Updated", Guid.NewGuid());

        // Assert
        Assert.Equal(originalCreatedAt, formation.CreatedAt);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Update_WithInvalidName_ShouldThrowArgumentException(string? invalidName)
    {
        // Arrange
        var formation = Formation.Create("Original", Guid.NewGuid());

        // Act & Assert
        Assert.Throws<ArgumentException>(() => formation.Update(invalidName!, Guid.NewGuid()));
    }

    [Fact]
    public void Update_WithEmptyGroupId_ShouldThrowArgumentException()
    {
        // Arrange
        var formation = Formation.Create("Test", Guid.NewGuid());

        // Act & Assert
        Assert.Throws<ArgumentException>(() => formation.Update("Updated", Guid.Empty));
    }

    [Fact]
    public void ClearPositions_OnEmptyFormation_ShouldNotThrow()
    {
        // Arrange
        var formation = Formation.Create("Test", Guid.NewGuid());

        // Act & Assert - 空のフォーメーションでもクリアは成功する
        var exception = Record.Exception(() => formation.ClearPositions());
        Assert.Null(exception);
        Assert.Empty(formation.Positions);
    }

    [Fact]
    public void AddPosition_AfterClear_ShouldAddNewPositions()
    {
        // Arrange
        var formation = Formation.Create("Test", Guid.NewGuid());
        formation.AddPosition(FormationPosition.Create(formation.Id, Guid.NewGuid(), 1, 1, 1));
        formation.ClearPositions();

        // Act
        formation.AddPosition(FormationPosition.Create(formation.Id, Guid.NewGuid(), 1, 1, 1));

        // Assert
        Assert.Single(formation.Positions);
    }
}

#endregion
