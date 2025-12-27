using FluentValidation;
using IdolManagement.Application.Songs.DTOs;

namespace IdolManagement.Application.Songs.Validators;

public class CreateSongDtoValidator : AbstractValidator<CreateSongDto>
{
    public CreateSongDtoValidator()
    {
        RuleFor(x => x.GroupId)
            .NotEmpty().WithMessage("グループは必須です");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("曲名は必須です")
            .MaximumLength(300).WithMessage("曲名は300文字以内で入力してください");

        RuleFor(x => x.Lyricist)
            .NotEmpty().WithMessage("作詞者は必須です")
            .MaximumLength(200).WithMessage("作詞者は200文字以内で入力してください");

        RuleFor(x => x.Composer)
            .NotEmpty().WithMessage("作曲者は必須です")
            .MaximumLength(200).WithMessage("作曲者は200文字以内で入力してください");

        RuleFor(x => x.Arranger)
            .MaximumLength(200).WithMessage("編曲者は200文字以内で入力してください")
            .When(x => x.Arranger != null);

        RuleFor(x => x.Lyrics)
            .MaximumLength(10000).WithMessage("歌詞は10000文字以内で入力してください")
            .When(x => x.Lyrics != null);
    }
}

public class UpdateSongDtoValidator : AbstractValidator<UpdateSongDto>
{
    public UpdateSongDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("曲名は必須です")
            .MaximumLength(300).WithMessage("曲名は300文字以内で入力してください");

        RuleFor(x => x.Lyricist)
            .NotEmpty().WithMessage("作詞者は必須です")
            .MaximumLength(200).WithMessage("作詞者は200文字以内で入力してください");

        RuleFor(x => x.Composer)
            .NotEmpty().WithMessage("作曲者は必須です")
            .MaximumLength(200).WithMessage("作曲者は200文字以内で入力してください");

        RuleFor(x => x.Arranger)
            .MaximumLength(200).WithMessage("編曲者は200文字以内で入力してください")
            .When(x => x.Arranger != null);

        RuleFor(x => x.Lyrics)
            .MaximumLength(10000).WithMessage("歌詞は10000文字以内で入力してください")
            .When(x => x.Lyrics != null);
    }
}
