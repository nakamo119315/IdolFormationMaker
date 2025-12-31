using IdolManagement.Application.Setlists.DTOs;
using IdolManagement.Application.Shared.Mappers;
using IdolManagement.Domain.Setlists.Repositories;

namespace IdolManagement.Application.Setlists.Queries;

public record GetSetlistQuery(Guid Id);

public class GetSetlistHandler
{
    private readonly ISetlistRepository _setlistRepository;

    public GetSetlistHandler(ISetlistRepository setlistRepository)
    {
        _setlistRepository = setlistRepository;
    }

    public async Task<SetlistDto?> HandleAsync(GetSetlistQuery query, CancellationToken cancellationToken = default)
    {
        var setlist = await _setlistRepository.GetByIdAsync(query.Id, cancellationToken);
        if (setlist == null)
            return null;

        return SetlistMapper.ToDto(setlist);
    }
}
