using IdolManagement.Application.Members.Queries;
using IdolManagement.Domain.Members.Entities;
using IdolManagement.Domain.Members.Repositories;
using Moq;

namespace IdolManagement.Application.Tests.Members;

public class GetAllMembersHandlerTests
{
    private readonly Mock<IMemberRepository> _mockRepository;
    private readonly GetAllMembersHandler _handler;

    public GetAllMembersHandlerTests()
    {
        _mockRepository = new Mock<IMemberRepository>();
        _handler = new GetAllMembersHandler(_mockRepository.Object);
    }

    #region フィルタリングテスト

    [Fact]
    public async Task HandleAsync_WithNoFilters_ShouldCallRepositoryWithNullFilters()
    {
        // Arrange
        var members = new List<Member>
        {
            CreateTestMember("Member1", Guid.NewGuid()),
            CreateTestMember("Member2", Guid.NewGuid())
        };
        _mockRepository
            .Setup(r => r.GetAllAsync(null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(members);

        var query = new GetAllMembersQuery();

        // Act
        var result = await _handler.HandleAsync(query);

        // Assert
        _mockRepository.Verify(
            r => r.GetAllAsync(null, null, null, It.IsAny<CancellationToken>()),
            Times.Once);
        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task HandleAsync_WithGroupIdFilter_ShouldPassGroupIdToRepository()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        var members = new List<Member> { CreateTestMember("Member1", groupId) };
        _mockRepository
            .Setup(r => r.GetAllAsync(groupId, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(members);

        var query = new GetAllMembersQuery(GroupId: groupId);

        // Act
        var result = await _handler.HandleAsync(query);

        // Assert
        _mockRepository.Verify(
            r => r.GetAllAsync(groupId, null, null, It.IsAny<CancellationToken>()),
            Times.Once);
        Assert.Single(result);
    }

    [Fact]
    public async Task HandleAsync_WithGenerationFilter_ShouldPassGenerationToRepository()
    {
        // Arrange
        var generation = 4;
        var members = new List<Member> { CreateTestMember("Member1", null, generation) };
        _mockRepository
            .Setup(r => r.GetAllAsync(null, generation, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(members);

        var query = new GetAllMembersQuery(Generation: generation);

        // Act
        var result = await _handler.HandleAsync(query);

        // Assert
        _mockRepository.Verify(
            r => r.GetAllAsync(null, generation, null, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task HandleAsync_WithIsGraduatedFilter_ShouldPassIsGraduatedToRepository()
    {
        // Arrange
        var members = new List<Member> { CreateTestMember("Graduated Member", null, null, true) };
        _mockRepository
            .Setup(r => r.GetAllAsync(null, null, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(members);

        var query = new GetAllMembersQuery(IsGraduated: true);

        // Act
        var result = await _handler.HandleAsync(query);

        // Assert
        _mockRepository.Verify(
            r => r.GetAllAsync(null, null, true, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task HandleAsync_WithAllFilters_ShouldPassAllFiltersToRepository()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        var generation = 5;
        var isGraduated = false;
        var members = new List<Member> { CreateTestMember("Member1", groupId, generation, isGraduated) };
        _mockRepository
            .Setup(r => r.GetAllAsync(groupId, generation, isGraduated, It.IsAny<CancellationToken>()))
            .ReturnsAsync(members);

        var query = new GetAllMembersQuery(groupId, generation, isGraduated);

        // Act
        var result = await _handler.HandleAsync(query);

        // Assert
        _mockRepository.Verify(
            r => r.GetAllAsync(groupId, generation, isGraduated, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion

    #region DTO変換テスト

    [Fact]
    public async Task HandleAsync_ShouldMapAllMemberPropertiesToDto()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        var member = Member.Create(
            "テストメンバー",
            new DateOnly(2000, 5, 15),
            "東京都",
            "ピンク",
            "白",
            groupId,
            generation: 3,
            isGraduated: true);

        _mockRepository
            .Setup(r => r.GetAllAsync(null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Member> { member });

        var query = new GetAllMembersQuery();

        // Act
        var result = (await _handler.HandleAsync(query)).Single();

        // Assert
        Assert.Equal(member.Id, result.Id);
        Assert.Equal("テストメンバー", result.Name);
        Assert.Equal(new DateOnly(2000, 5, 15), result.BirthDate);
        Assert.Equal("東京都", result.Birthplace);
        Assert.Equal("ピンク", result.PenLightColor1);
        Assert.Equal("白", result.PenLightColor2);
        Assert.Equal(groupId, result.GroupId);
        Assert.Equal(3, result.Generation);
        Assert.True(result.IsGraduated);
    }

    [Fact]
    public async Task HandleAsync_WithMemberImages_ShouldIncludeImagesInDto()
    {
        // Arrange
        var member = Member.Create("テストメンバー", new DateOnly(2000, 1, 1));
        member.AddImage(MemberImage.Create(member.Id, "https://example.com/primary.jpg", true));
        member.AddImage(MemberImage.Create(member.Id, "https://example.com/secondary.jpg", false));

        _mockRepository
            .Setup(r => r.GetAllAsync(null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Member> { member });

        var query = new GetAllMembersQuery();

        // Act
        var result = (await _handler.HandleAsync(query)).Single();

        // Assert
        Assert.Equal(2, result.Images.Count());
        Assert.Contains(result.Images, i => i.IsPrimary && i.Url == "https://example.com/primary.jpg");
        Assert.Contains(result.Images, i => !i.IsPrimary && i.Url == "https://example.com/secondary.jpg");
    }

    #endregion

    #region エッジケーステスト

    [Fact]
    public async Task HandleAsync_WithEmptyResult_ShouldReturnEmptyCollection()
    {
        // Arrange
        _mockRepository
            .Setup(r => r.GetAllAsync(It.IsAny<Guid?>(), It.IsAny<int?>(), It.IsAny<bool?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Member>());

        var query = new GetAllMembersQuery(GroupId: Guid.NewGuid());

        // Act
        var result = await _handler.HandleAsync(query);

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public async Task HandleAsync_ShouldRespectCancellationToken()
    {
        // Arrange
        var cts = new CancellationTokenSource();
        _mockRepository
            .Setup(r => r.GetAllAsync(It.IsAny<Guid?>(), It.IsAny<int?>(), It.IsAny<bool?>(), cts.Token))
            .ReturnsAsync(new List<Member>());

        var query = new GetAllMembersQuery();

        // Act
        await _handler.HandleAsync(query, cts.Token);

        // Assert
        _mockRepository.Verify(
            r => r.GetAllAsync(It.IsAny<Guid?>(), It.IsAny<int?>(), It.IsAny<bool?>(), cts.Token),
            Times.Once);
    }

    #endregion

    #region ヘルパーメソッド

    private static Member CreateTestMember(
        string name,
        Guid? groupId,
        int? generation = null,
        bool isGraduated = false)
    {
        return Member.Create(
            name,
            new DateOnly(2000, 1, 1),
            groupId: groupId,
            generation: generation,
            isGraduated: isGraduated);
    }

    #endregion
}
