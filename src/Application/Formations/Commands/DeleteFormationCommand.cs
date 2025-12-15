using IdolManagement.Domain.Formations.Repositories;

namespace IdolManagement.Application.Formations.Commands;

public record DeleteFormationCommand(Guid Id);

public class DeleteFormationHandler
{
    private readonly IFormationRepository _formationRepository;

    public DeleteFormationHandler(IFormationRepository formationRepository)
    {
        _formationRepository = formationRepository;
    }

    public async Task<bool> HandleAsync(DeleteFormationCommand command, CancellationToken cancellationToken = default)
    {
        var formation = await _formationRepository.GetByIdAsync(command.Id, cancellationToken);
        if (formation == null)
            return false;

        await _formationRepository.DeleteAsync(command.Id, cancellationToken);
        return true;
    }
}
