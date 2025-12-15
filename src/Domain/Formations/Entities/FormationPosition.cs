namespace IdolManagement.Domain.Formations.Entities;

public class FormationPosition
{
    public Guid Id { get; private set; }
    public Guid FormationId { get; private set; }
    public Guid MemberId { get; private set; }
    public int PositionNumber { get; private set; }
    public int Row { get; private set; }
    public int Column { get; private set; }

    private FormationPosition() { }

    public static FormationPosition Create(Guid formationId, Guid memberId, int positionNumber, int row, int column)
    {
        if (formationId == Guid.Empty)
            throw new ArgumentException("FormationId is required.", nameof(formationId));

        if (memberId == Guid.Empty)
            throw new ArgumentException("MemberId is required.", nameof(memberId));

        return new FormationPosition
        {
            Id = Guid.NewGuid(),
            FormationId = formationId,
            MemberId = memberId,
            PositionNumber = positionNumber,
            Row = row,
            Column = column
        };
    }

    public void Update(int positionNumber, int row, int column)
    {
        PositionNumber = positionNumber;
        Row = row;
        Column = column;
    }
}
