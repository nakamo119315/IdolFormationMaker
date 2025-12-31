using IdolManagement.Application.Members.DTOs;
using IdolManagement.Domain.Members.Entities;

namespace IdolManagement.Application.Shared.Mappers;

public static class MemberMapper
{
    public static MemberDto ToDto(Member member) => new(
        member.Id,
        member.Name,
        member.BirthDate,
        member.Birthplace,
        member.PenLightColor1,
        member.PenLightColor2,
        member.GroupId,
        member.Generation,
        member.IsGraduated,
        member.Images.Select(ToDto),
        member.CreatedAt,
        member.UpdatedAt
    );

    public static MemberImageDto ToDto(MemberImage image) => new(
        image.Id,
        image.Url,
        image.IsPrimary,
        image.CreatedAt
    );

    public static IEnumerable<MemberDto> ToDto(IEnumerable<Member> members) =>
        members.Select(ToDto);
}
