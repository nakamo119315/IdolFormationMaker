using IdolManagement.Application.Groups.Commands;
using IdolManagement.Application.Groups.DTOs;
using IdolManagement.Domain.Groups.Entities;
using IdolManagement.Domain.Groups.Repositories;
using Moq;

namespace IdolManagement.Application.Tests.Groups;

public class CreateGroupHandlerTests
{
    private readonly Mock<IGroupRepository> _groupRepositoryMock;
    private readonly CreateGroupHandler _handler;

    public CreateGroupHandlerTests()
    {
        _groupRepositoryMock = new Mock<IGroupRepository>();
        _handler = new CreateGroupHandler(_groupRepositoryMock.Object);
    }

    [Fact]
    public async Task HandleAsync_WithValidData_ShouldCreateAndReturnGroup()
    {
        // Arrange
        var dto = new CreateGroupDto("Test Group", new DateOnly(2020, 5, 1));
        var command = new CreateGroupCommand(dto);

        _groupRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Group>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Group g, CancellationToken _) => g);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dto.Name, result.Name);
        Assert.Equal(dto.DebutDate, result.DebutDate);
        Assert.Empty(result.Members);

        _groupRepositoryMock.Verify(
            r => r.AddAsync(It.Is<Group>(g => g.Name == dto.Name), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task HandleAsync_WithoutDebutDate_ShouldCreateGroupWithNullDebutDate()
    {
        // Arrange
        var dto = new CreateGroupDto("Test Group", null);
        var command = new CreateGroupCommand(dto);

        _groupRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Group>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Group g, CancellationToken _) => g);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.NotNull(result);
        Assert.Null(result.DebutDate);
    }
}
