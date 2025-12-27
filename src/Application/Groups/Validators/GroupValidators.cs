using FluentValidation;
using IdolManagement.Application.Groups.DTOs;

namespace IdolManagement.Application.Groups.Validators;

public class CreateGroupDtoValidator : AbstractValidator<CreateGroupDto>
{
    public CreateGroupDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("グループ名は必須です")
            .MaximumLength(200).WithMessage("グループ名は200文字以内で入力してください");

        RuleFor(x => x.DebutDate)
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("デビュー日は今日以前の日付を入力してください")
            .When(x => x.DebutDate.HasValue);
    }
}

public class UpdateGroupDtoValidator : AbstractValidator<UpdateGroupDto>
{
    public UpdateGroupDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("グループ名は必須です")
            .MaximumLength(200).WithMessage("グループ名は200文字以内で入力してください");

        RuleFor(x => x.DebutDate)
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("デビュー日は今日以前の日付を入力してください")
            .When(x => x.DebutDate.HasValue);
    }
}
