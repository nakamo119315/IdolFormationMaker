using FluentValidation;
using IdolManagement.Application.Formations.DTOs;

namespace IdolManagement.Application.Formations.Validators;

public class CreateFormationDtoValidator : AbstractValidator<CreateFormationDto>
{
    public CreateFormationDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("フォーメーション名は必須です")
            .MaximumLength(300).WithMessage("フォーメーション名は300文字以内で入力してください");

        RuleFor(x => x.GroupId)
            .NotEmpty().WithMessage("グループは必須です");

        RuleFor(x => x.Positions)
            .NotEmpty().WithMessage("ポジションを1つ以上指定してください");

        RuleForEach(x => x.Positions)
            .SetValidator(new CreateFormationPositionDtoValidator());
    }
}

public class CreateFormationPositionDtoValidator : AbstractValidator<CreateFormationPositionDto>
{
    public CreateFormationPositionDtoValidator()
    {
        RuleFor(x => x.MemberId)
            .NotEmpty().WithMessage("メンバーは必須です");

        RuleFor(x => x.PositionNumber)
            .GreaterThan(0).WithMessage("ポジション番号は1以上を指定してください")
            .LessThanOrEqualTo(99).WithMessage("ポジション番号は99以下を指定してください");

        RuleFor(x => x.Row)
            .GreaterThan(0).WithMessage("列は1以上を指定してください")
            .LessThanOrEqualTo(10).WithMessage("列は10以下を指定してください");

        RuleFor(x => x.Column)
            .GreaterThan(0).WithMessage("行は1以上を指定してください")
            .LessThanOrEqualTo(20).WithMessage("行は20以下を指定してください");
    }
}

public class UpdateFormationDtoValidator : AbstractValidator<UpdateFormationDto>
{
    public UpdateFormationDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("フォーメーション名は必須です")
            .MaximumLength(300).WithMessage("フォーメーション名は300文字以内で入力してください");

        RuleFor(x => x.GroupId)
            .NotEmpty().WithMessage("グループは必須です");

        RuleFor(x => x.Positions)
            .NotEmpty().WithMessage("ポジションを1つ以上指定してください");

        RuleForEach(x => x.Positions)
            .SetValidator(new CreateFormationPositionDtoValidator());
    }
}
