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
}
