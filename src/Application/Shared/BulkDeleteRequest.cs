namespace IdolManagement.Application.Shared;

public record BulkDeleteRequest(IEnumerable<Guid> Ids);
