namespace IdolManagement.Domain.Shared.Exceptions;

/// <summary>
/// ドメイン層で発生する例外の基底クラス
/// </summary>
public abstract class DomainException : Exception
{
    public string Code { get; }

    protected DomainException(string code, string message) : base(message)
    {
        Code = code;
    }

    protected DomainException(string code, string message, Exception innerException)
        : base(message, innerException)
    {
        Code = code;
    }
}

/// <summary>
/// リソースが見つからない場合の例外
/// </summary>
public class NotFoundException : DomainException
{
    public NotFoundException(string entityName, object id)
        : base("NOT_FOUND", $"{entityName} with id '{id}' was not found.")
    {
    }

    public NotFoundException(string message)
        : base("NOT_FOUND", message)
    {
    }
}

/// <summary>
/// ビジネスルール違反の例外
/// </summary>
public class BusinessRuleException : DomainException
{
    public BusinessRuleException(string message)
        : base("BUSINESS_RULE_VIOLATION", message)
    {
    }

    public BusinessRuleException(string code, string message)
        : base(code, message)
    {
    }
}

/// <summary>
/// 競合が発生した場合の例外（重複など）
/// </summary>
public class ConflictException : DomainException
{
    public ConflictException(string message)
        : base("CONFLICT", message)
    {
    }

    public ConflictException(string entityName, string field, object value)
        : base("CONFLICT", $"{entityName} with {field} '{value}' already exists.")
    {
    }
}
