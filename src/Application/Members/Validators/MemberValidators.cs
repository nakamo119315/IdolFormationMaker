using FluentValidation;
using IdolManagement.Application.Members.DTOs;

namespace IdolManagement.Application.Members.Validators;

public class CreateMemberDtoValidator : AbstractValidator<CreateMemberDto>
{
    public CreateMemberDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("名前は必須です")
            .MaximumLength(100).WithMessage("名前は100文字以内で入力してください");

        RuleFor(x => x.BirthDate)
            .NotEmpty().WithMessage("生年月日は必須です")
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("生年月日は今日以前の日付を入力してください");

        RuleFor(x => x.Birthplace)
            .MaximumLength(100).WithMessage("出身地は100文字以内で入力してください")
            .When(x => x.Birthplace != null);

        RuleFor(x => x.PenLightColor1)
            .MaximumLength(50).WithMessage("ペンライトカラー1は50文字以内で入力してください")
            .When(x => x.PenLightColor1 != null);

        RuleFor(x => x.PenLightColor2)
            .MaximumLength(50).WithMessage("ペンライトカラー2は50文字以内で入力してください")
            .When(x => x.PenLightColor2 != null);

        RuleFor(x => x.Generation)
            .GreaterThan(0).WithMessage("期は1以上の値を入力してください")
            .LessThanOrEqualTo(99).WithMessage("期は99以下の値を入力してください")
            .When(x => x.Generation.HasValue);
    }
}

public class UpdateMemberDtoValidator : AbstractValidator<UpdateMemberDto>
{
    public UpdateMemberDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("名前は必須です")
            .MaximumLength(100).WithMessage("名前は100文字以内で入力してください");

        RuleFor(x => x.BirthDate)
            .NotEmpty().WithMessage("生年月日は必須です")
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("生年月日は今日以前の日付を入力してください");

        RuleFor(x => x.Birthplace)
            .MaximumLength(100).WithMessage("出身地は100文字以内で入力してください")
            .When(x => x.Birthplace != null);

        RuleFor(x => x.PenLightColor1)
            .MaximumLength(50).WithMessage("ペンライトカラー1は50文字以内で入力してください")
            .When(x => x.PenLightColor1 != null);

        RuleFor(x => x.PenLightColor2)
            .MaximumLength(50).WithMessage("ペンライトカラー2は50文字以内で入力してください")
            .When(x => x.PenLightColor2 != null);

        RuleFor(x => x.Generation)
            .GreaterThan(0).WithMessage("期は1以上の値を入力してください")
            .LessThanOrEqualTo(99).WithMessage("期は99以下の値を入力してください")
            .When(x => x.Generation.HasValue);
    }
}

public class AddMemberImageDtoValidator : AbstractValidator<AddMemberImageDto>
{
    public AddMemberImageDtoValidator()
    {
        RuleFor(x => x.Url)
            .NotEmpty().WithMessage("画像URLは必須です")
            .MaximumLength(2000).WithMessage("URLは2000文字以内で入力してください")
            .Must(BeAValidUrl).WithMessage("有効なURLを入力してください");
    }

    private static bool BeAValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
