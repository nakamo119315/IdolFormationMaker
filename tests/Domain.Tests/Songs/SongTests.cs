using IdolManagement.Domain.Songs.Entities;

namespace IdolManagement.Domain.Tests.Songs;

public class SongTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateSong()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        var title = "Test Song";
        var lyricist = "作詞者";
        var composer = "作曲者";
        var arranger = "編曲者";
        var lyrics = "歌詞テスト";

        // Act
        var song = Song.Create(groupId, title, lyricist, composer, arranger, lyrics);

        // Assert
        Assert.NotEqual(Guid.Empty, song.Id);
        Assert.Equal(groupId, song.GroupId);
        Assert.Equal(title, song.Title);
        Assert.Equal(lyricist, song.Lyricist);
        Assert.Equal(composer, song.Composer);
        Assert.Equal(arranger, song.Arranger);
        Assert.Equal(lyrics, song.Lyrics);
        Assert.True(song.CreatedAt <= DateTime.UtcNow);
        Assert.True(song.UpdatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public void Create_WithoutOptionalFields_ShouldCreateSongWithNulls()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        var title = "Test Song";
        var lyricist = "作詞者";
        var composer = "作曲者";

        // Act
        var song = Song.Create(groupId, title, lyricist, composer);

        // Assert
        Assert.Null(song.Arranger);
        Assert.Null(song.Lyrics);
    }

    [Fact]
    public void Create_WithEmptyGroupId_ShouldThrowArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() => Song.Create(Guid.Empty, "Title", "Lyricist", "Composer"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidTitle_ShouldThrowArgumentException(string? title)
    {
        // Arrange
        var groupId = Guid.NewGuid();

        // Act & Assert
        Assert.Throws<ArgumentException>(() => Song.Create(groupId, title!, "Lyricist", "Composer"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidLyricist_ShouldThrowArgumentException(string? lyricist)
    {
        // Arrange
        var groupId = Guid.NewGuid();

        // Act & Assert
        Assert.Throws<ArgumentException>(() => Song.Create(groupId, "Title", lyricist!, "Composer"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidComposer_ShouldThrowArgumentException(string? composer)
    {
        // Arrange
        var groupId = Guid.NewGuid();

        // Act & Assert
        Assert.Throws<ArgumentException>(() => Song.Create(groupId, "Title", "Lyricist", composer!));
    }

    [Fact]
    public void Update_WithValidData_ShouldUpdateSong()
    {
        // Arrange
        var song = Song.Create(Guid.NewGuid(), "Original", "Lyricist1", "Composer1");
        var originalUpdatedAt = song.UpdatedAt;

        System.Threading.Thread.Sleep(10);

        // Act
        song.Update("Updated Title", "Lyricist2", "Composer2", "Arranger", "Lyrics");

        // Assert
        Assert.Equal("Updated Title", song.Title);
        Assert.Equal("Lyricist2", song.Lyricist);
        Assert.Equal("Composer2", song.Composer);
        Assert.Equal("Arranger", song.Arranger);
        Assert.Equal("Lyrics", song.Lyrics);
        Assert.True(song.UpdatedAt > originalUpdatedAt);
    }

    [Fact]
    public void Update_WithInvalidTitle_ShouldThrowArgumentException()
    {
        // Arrange
        var song = Song.Create(Guid.NewGuid(), "Original", "Lyricist", "Composer");

        // Act & Assert
        Assert.Throws<ArgumentException>(() => song.Update("", "Lyricist", "Composer", null, null));
    }
}
