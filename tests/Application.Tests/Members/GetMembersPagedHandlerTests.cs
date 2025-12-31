using IdolManagement.Application.Members.Queries;
using IdolManagement.Domain.Members.Entities;
using IdolManagement.Domain.Members.Repositories;
using Moq;

namespace IdolManagement.Application.Tests.Members;

public class GetMembersPagedHandlerTests
{
    private readonly Mock<IMemberRepository> _mockRepository;
    private readonly GetMembersPagedHandler _handler;

    public GetMembersPagedHandlerTests()
    {
        _mockRepository = new Mock<IMemberRepository>();
        _handler = new GetMembersPagedHandler(_mockRepository.Object);
    }

    #region ページングテスト

    [Fact]
    public async Task HandleAsync_ShouldReturnCorrectPagedResult()
    {
        // Arrange
        var members = CreateTestMembers(5);
        _mockRepository
            .Setup(r => r.GetPagedAsync(1, 20, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((members, 5));

        var query = new GetMembersPagedQuery();

        // Act
        var result = await _handler.HandleAsync(query);

        // Assert
        Assert.Equal(5, result.Items.Count());
        Assert.Equal(5, result.TotalCount);
        Assert.Equal(1, result.Page);
        Assert.Equal(20, result.PageSize);
        Assert.Equal(1, result.TotalPages);
    }

    [Fact]
    public async Task HandleAsync_WithPagination_ShouldCalculateTotalPagesCorrectly()
    {
        // Arrange
        var members = CreateTestMembers(10);
        _mockRepository
            .Setup(r => r.GetPagedAsync(1, 10, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((members, 95)); // 95件を10件ずつ = 10ページ

        var query = new GetMembersPagedQuery(Page: 1, PageSize: 10);

        // Act
        var result = await _handler.HandleAsync(query);

        // Assert
        Assert.Equal(10, result.TotalPages); // ceil(95/10) = 10
    }

    [Fact]
    public async Task HandleAsync_WithPage2_ShouldPassCorrectPageToRepository()
    {
        // Arrange
        _mockRepository
            .Setup(r => r.GetPagedAsync(2, 20, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<Member>(), 0));

        var query = new GetMembersPagedQuery(Page: 2);

        // Act
        await _handler.HandleAsync(query);

        // Assert
        _mockRepository.Verify(
            r => r.GetPagedAsync(2, 20, null, null, null, null, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task HandleAsync_WithCustomPageSize_ShouldPassCorrectPageSizeToRepository()
    {
        // Arrange
        _mockRepository
            .Setup(r => r.GetPagedAsync(1, 50, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<Member>(), 0));

        var query = new GetMembersPagedQuery(PageSize: 50);

        // Act
        await _handler.HandleAsync(query);

        // Assert
        _mockRepository.Verify(
            r => r.GetPagedAsync(1, 50, null, null, null, null, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion

    #region フィルタリングテスト

    [Fact]
    public async Task HandleAsync_WithSearchFilter_ShouldPassSearchToRepository()
    {
        // Arrange
        var searchTerm = "山田";
        _mockRepository
            .Setup(r => r.GetPagedAsync(1, 20, searchTerm, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<Member>(), 0));

        var query = new GetMembersPagedQuery(Search: searchTerm);

        // Act
        await _handler.HandleAsync(query);

        // Assert
        _mockRepository.Verify(
            r => r.GetPagedAsync(1, 20, searchTerm, null, null, null, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task HandleAsync_WithGroupIdFilter_ShouldPassGroupIdToRepository()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        _mockRepository
            .Setup(r => r.GetPagedAsync(1, 20, null, groupId, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<Member>(), 0));

        var query = new GetMembersPagedQuery(GroupId: groupId);

        // Act
        await _handler.HandleAsync(query);

        // Assert
        _mockRepository.Verify(
            r => r.GetPagedAsync(1, 20, null, groupId, null, null, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task HandleAsync_WithGenerationFilter_ShouldPassGenerationToRepository()
    {
        // Arrange
        var generation = 4;
        _mockRepository
            .Setup(r => r.GetPagedAsync(1, 20, null, null, generation, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<Member>(), 0));

        var query = new GetMembersPagedQuery(Generation: generation);

        // Act
        await _handler.HandleAsync(query);

        // Assert
        _mockRepository.Verify(
            r => r.GetPagedAsync(1, 20, null, null, generation, null, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task HandleAsync_WithIsGraduatedFilter_ShouldPassIsGraduatedToRepository()
    {
        // Arrange
        _mockRepository
            .Setup(r => r.GetPagedAsync(1, 20, null, null, null, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<Member>(), 0));

        var query = new GetMembersPagedQuery(IsGraduated: true);

        // Act
        await _handler.HandleAsync(query);

        // Assert
        _mockRepository.Verify(
            r => r.GetPagedAsync(1, 20, null, null, null, true, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task HandleAsync_WithAllFilters_ShouldPassAllFiltersToRepository()
    {
        // Arrange
        var page = 2;
        var pageSize = 15;
        var search = "テスト";
        var groupId = Guid.NewGuid();
        var generation = 5;
        var isGraduated = false;

        _mockRepository
            .Setup(r => r.GetPagedAsync(page, pageSize, search, groupId, generation, isGraduated, It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<Member>(), 0));

        var query = new GetMembersPagedQuery(page, pageSize, search, groupId, generation, isGraduated);

        // Act
        await _handler.HandleAsync(query);

        // Assert
        _mockRepository.Verify(
            r => r.GetPagedAsync(page, pageSize, search, groupId, generation, isGraduated, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion

    #region エッジケーステスト

    [Fact]
    public async Task HandleAsync_WithEmptyResult_ShouldReturnEmptyPagedResult()
    {
        // Arrange
        _mockRepository
            .Setup(r => r.GetPagedAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string?>(), It.IsAny<Guid?>(), It.IsAny<int?>(), It.IsAny<bool?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<Member>(), 0));

        var query = new GetMembersPagedQuery();

        // Act
        var result = await _handler.HandleAsync(query);

        // Assert
        Assert.Empty(result.Items);
        Assert.Equal(0, result.TotalCount);
        Assert.Equal(0, result.TotalPages);
    }

    [Fact]
    public async Task HandleAsync_WithLargeDataset_ShouldHandlePaginationCorrectly()
    {
        // Arrange
        var members = CreateTestMembers(100);
        _mockRepository
            .Setup(r => r.GetPagedAsync(5, 20, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((members.Take(20).ToList(), 1000)); // 1000件中の5ページ目

        var query = new GetMembersPagedQuery(Page: 5, PageSize: 20);

        // Act
        var result = await _handler.HandleAsync(query);

        // Assert
        Assert.Equal(20, result.Items.Count());
        Assert.Equal(1000, result.TotalCount);
        Assert.Equal(50, result.TotalPages); // ceil(1000/20) = 50
        Assert.Equal(5, result.Page);
    }

    [Fact]
    public async Task HandleAsync_ShouldMapMemberPropertiesToDto()
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
            .Setup(r => r.GetPagedAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string?>(), It.IsAny<Guid?>(), It.IsAny<int?>(), It.IsAny<bool?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<Member> { member }, 1));

        var query = new GetMembersPagedQuery();

        // Act
        var result = await _handler.HandleAsync(query);
        var dto = result.Items.Single();

        // Assert
        Assert.Equal(member.Id, dto.Id);
        Assert.Equal("テストメンバー", dto.Name);
        Assert.Equal(new DateOnly(2000, 5, 15), dto.BirthDate);
        Assert.Equal("東京都", dto.Birthplace);
        Assert.Equal("ピンク", dto.PenLightColor1);
        Assert.Equal("白", dto.PenLightColor2);
        Assert.Equal(groupId, dto.GroupId);
        Assert.Equal(3, dto.Generation);
        Assert.True(dto.IsGraduated);
    }

    #endregion

    #region ヘルパーメソッド

    private static List<Member> CreateTestMembers(int count)
    {
        return Enumerable.Range(0, count)
            .Select(i => Member.Create($"Member{i}", new DateOnly(2000, 1, 1)))
            .ToList();
    }

    #endregion
}
