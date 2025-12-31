using IdolManagement.Application.Conversations.Commands;
using IdolManagement.Application.Conversations.DTOs;
using IdolManagement.Domain.Conversations.Entities;
using IdolManagement.Domain.Conversations.Repositories;
using Moq;

namespace IdolManagement.Application.Tests.Conversations;

public class UpdateConversationHandlerTests
{
    private readonly Mock<IConversationRepository> _mockRepository;
    private readonly UpdateConversationHandler _handler;

    public UpdateConversationHandlerTests()
    {
        _mockRepository = new Mock<IConversationRepository>();
        _handler = new UpdateConversationHandler(_mockRepository.Object);
    }

    [Fact]
    public async Task HandleAsync_ShouldUpdateMemberIdAndDate_WhenValuesProvided()
    {
        // Arrange
        var conversationId = Guid.NewGuid();
        var newMemberId = Guid.NewGuid();
        var newDate = new DateOnly(2024, 6, 15);

        var existingConversation = MeetGreetConversation.Create(
            "Original Title",
            new DateOnly(2024, 1, 1),
            null,
            null
        );
        // Use reflection to set the ID since it's private
        typeof(MeetGreetConversation)
            .GetProperty("Id")!
            .SetValue(existingConversation, conversationId);

        var updatedConversation = MeetGreetConversation.Create(
            "Updated Title",
            newDate,
            newMemberId,
            "Test Member"
        );
        typeof(MeetGreetConversation)
            .GetProperty("Id")!
            .SetValue(updatedConversation, conversationId);

        _mockRepository
            .Setup(r => r.GetByIdAsync(conversationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingConversation);

        _mockRepository
            .Setup(r => r.UpdateAsync(
                conversationId,
                "Updated Title",
                newMemberId,
                newDate,
                It.IsAny<IEnumerable<ConversationMessageData>>(),
                It.IsAny<CancellationToken>()))
            .Callback(() =>
            {
                // Simulate what the repository does
                existingConversation.Update("Updated Title", newMemberId, "Test Member", newDate);
            })
            .Returns(Task.CompletedTask);

        var dto = new UpdateConversationDto(
            "Updated Title",
            newMemberId,
            newDate,
            new List<CreateMessageDto>
            {
                new(SpeakerType.Self, "Hello", 1)
            }
        );
        var command = new UpdateConversationCommand(conversationId, dto);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(newMemberId, result.MemberId);
        Assert.Equal("Test Member", result.MemberName);
        Assert.Equal(newDate, result.ConversationDate);
        Assert.Equal("Updated Title", result.Title);
    }

    [Fact]
    public async Task HandleAsync_ShouldSetMemberIdToNull_WhenNotProvided()
    {
        // Arrange
        var conversationId = Guid.NewGuid();
        var originalMemberId = Guid.NewGuid();

        var existingConversation = MeetGreetConversation.Create(
            "Original Title",
            new DateOnly(2024, 1, 1),
            originalMemberId,
            "Original Member"
        );
        typeof(MeetGreetConversation)
            .GetProperty("Id")!
            .SetValue(existingConversation, conversationId);

        _mockRepository
            .Setup(r => r.GetByIdAsync(conversationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingConversation);

        _mockRepository
            .Setup(r => r.UpdateAsync(
                conversationId,
                "Updated Title",
                null,  // MemberId is null
                It.IsAny<DateOnly?>(),
                It.IsAny<IEnumerable<ConversationMessageData>>(),
                It.IsAny<CancellationToken>()))
            .Callback(() =>
            {
                existingConversation.Update("Updated Title", null, null, null);
            })
            .Returns(Task.CompletedTask);

        var dto = new UpdateConversationDto(
            "Updated Title",
            null,  // No member
            null,
            new List<CreateMessageDto>()
        );
        var command = new UpdateConversationCommand(conversationId, dto);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.NotNull(result);
        Assert.Null(result.MemberId);
        Assert.Null(result.MemberName);
    }

    [Fact]
    public async Task HandleAsync_ShouldReturnNull_WhenConversationNotFound()
    {
        // Arrange
        var conversationId = Guid.NewGuid();

        _mockRepository
            .Setup(r => r.GetByIdAsync(conversationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((MeetGreetConversation?)null);

        var dto = new UpdateConversationDto(
            "Title",
            null,
            null,
            new List<CreateMessageDto>()
        );
        var command = new UpdateConversationCommand(conversationId, dto);

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert
        Assert.Null(result);
    }
}
