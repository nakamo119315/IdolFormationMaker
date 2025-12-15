using IdolManagement.Application.Formations.Commands;
using IdolManagement.Application.Formations.DTOs;
using IdolManagement.Domain.Formations.Entities;
using IdolManagement.Domain.Formations.Repositories;
using Moq;

namespace IdolManagement.Application.Tests.Formations;

public class CreateFormationHandlerTests
{
    private readonly Mock<IFormationRepository> _formationRepositoryMock;
    private readonly CreateFormationHandler _handler;

    public CreateFormationHandlerTests()
    {
        _formationRepositoryMock = new Mock<IFormationRepository>();
        _handler = new CreateFormationHandler(_formationRepositoryMock.Object);
    }

    [Fact]
    public async Task HandleAsync_WithValidData_ShouldCreateAndReturnFormation()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        var memberId = Guid.NewGuid();
        var positions = new List<CreateFormationPositionDto>
        {
            new(memberId, 1, 1, 1)
        };
        var dto = new CreateFormationDto("Test Formation", groupId, positions);
        var command = new CreateFormationCommand(dto);

        _formationRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Formation>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Formation f, CancellationToken _) => f);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dto.Name, result.Name);
        Assert.Equal(dto.GroupId, result.GroupId);
        Assert.Single(result.Positions);
        Assert.Equal(memberId, result.Positions.First().MemberId);

        _formationRepositoryMock.Verify(
            r => r.AddAsync(It.Is<Formation>(f => f.Name == dto.Name), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task HandleAsync_WithMultiplePositions_ShouldCreateFormationWithAllPositions()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        var positions = new List<CreateFormationPositionDto>
        {
            new(Guid.NewGuid(), 1, 1, 1),
            new(Guid.NewGuid(), 2, 1, 2),
            new(Guid.NewGuid(), 3, 2, 1)
        };
        var dto = new CreateFormationDto("Test Formation", groupId, positions);
        var command = new CreateFormationCommand(dto);

        _formationRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Formation>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Formation f, CancellationToken _) => f);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.Positions.Count());
    }

    [Fact]
    public async Task HandleAsync_WithEmptyPositions_ShouldCreateFormationWithNoPositions()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        var dto = new CreateFormationDto("Test Formation", groupId, new List<CreateFormationPositionDto>());
        var command = new CreateFormationCommand(dto);

        _formationRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Formation>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Formation f, CancellationToken _) => f);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result.Positions);
    }
}
