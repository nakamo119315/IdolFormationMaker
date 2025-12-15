using IdolManagement.Application.Members.Queries;
using IdolManagement.Domain.Members.Entities;
using IdolManagement.Domain.Members.Repositories;
using Moq;

namespace IdolManagement.Application.Tests.Members;

public class GetMemberHandlerTests
{
    private readonly Mock<IMemberRepository> _memberRepositoryMock;
    private readonly GetMemberHandler _handler;

    public GetMemberHandlerTests()
    {
        _memberRepositoryMock = new Mock<IMemberRepository>();
        _handler = new GetMemberHandler(_memberRepositoryMock.Object);
    }

    [Fact]
    public async Task HandleAsync_WithExistingId_ShouldReturnMember()
    {
        // Arrange
        var member = Member.Create("Test Member", new DateOnly(2000, 1, 15));
        var query = new GetMemberQuery(member.Id);

        _memberRepositoryMock
            .Setup(r => r.GetByIdAsync(member.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(member);

        // Act
        var result = await _handler.HandleAsync(query);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(member.Id, result.Id);
        Assert.Equal(member.Name, result.Name);
        Assert.Equal(member.BirthDate, result.BirthDate);
    }

    [Fact]
    public async Task HandleAsync_WithNonExistingId_ShouldReturnNull()
    {
        // Arrange
        var nonExistingId = Guid.NewGuid();
        var query = new GetMemberQuery(nonExistingId);

        _memberRepositoryMock
            .Setup(r => r.GetByIdAsync(nonExistingId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Member?)null);

        // Act
        var result = await _handler.HandleAsync(query);

        // Assert
        Assert.Null(result);
    }
}
