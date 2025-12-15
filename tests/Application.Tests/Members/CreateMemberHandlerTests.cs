using IdolManagement.Application.Members.Commands;
using IdolManagement.Application.Members.DTOs;
using IdolManagement.Domain.Members.Entities;
using IdolManagement.Domain.Members.Repositories;
using Moq;

namespace IdolManagement.Application.Tests.Members;

public class CreateMemberHandlerTests
{
    private readonly Mock<IMemberRepository> _memberRepositoryMock;
    private readonly CreateMemberHandler _handler;

    public CreateMemberHandlerTests()
    {
        _memberRepositoryMock = new Mock<IMemberRepository>();
        _handler = new CreateMemberHandler(_memberRepositoryMock.Object);
    }

    [Fact]
    public async Task HandleAsync_WithValidData_ShouldCreateAndReturnMember()
    {
        // Arrange
        var dto = new CreateMemberDto("Test Member", new DateOnly(2000, 1, 15), null);
        var command = new CreateMemberCommand(dto);

        _memberRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Member>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Member m, CancellationToken _) => m);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dto.Name, result.Name);
        Assert.Equal(dto.BirthDate, result.BirthDate);
        Assert.Null(result.GroupId);
        Assert.Empty(result.Images);

        _memberRepositoryMock.Verify(
            r => r.AddAsync(It.Is<Member>(m => m.Name == dto.Name), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task HandleAsync_WithGroupId_ShouldCreateMemberWithGroup()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        var dto = new CreateMemberDto("Test Member", new DateOnly(2000, 1, 15), groupId);
        var command = new CreateMemberCommand(dto);

        _memberRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Member>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Member m, CancellationToken _) => m);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(groupId, result.GroupId);
    }
}
