using System.Text.Json;
using FluentValidation;
using IdolManagement.Domain.Shared.Exceptions;

namespace IdolManagement.Presentation.Middlewares;

public class GlobalExceptionHandler : IMiddleware
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, response) = exception switch
        {
            NotFoundException ex => (
                StatusCodes.Status404NotFound,
                new ErrorResponse(ex.Code, ex.Message)
            ),
            BusinessRuleException ex => (
                StatusCodes.Status400BadRequest,
                new ErrorResponse(ex.Code, ex.Message)
            ),
            ConflictException ex => (
                StatusCodes.Status409Conflict,
                new ErrorResponse(ex.Code, ex.Message)
            ),
            ValidationException ex => (
                StatusCodes.Status400BadRequest,
                new ErrorResponse(
                    "VALIDATION_ERROR",
                    "Validation failed",
                    ex.Errors.Select(e => new ValidationError(e.PropertyName, e.ErrorMessage)).ToList()
                )
            ),
            ArgumentException ex => (
                StatusCodes.Status400BadRequest,
                new ErrorResponse("INVALID_ARGUMENT", ex.Message)
            ),
            InvalidOperationException ex => (
                StatusCodes.Status400BadRequest,
                new ErrorResponse("INVALID_OPERATION", ex.Message)
            ),
            _ => (
                StatusCodes.Status500InternalServerError,
                new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred")
            )
        };

        // 500エラーの場合のみ詳細ログを出力
        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);
        }
        else
        {
            _logger.LogWarning("Handled exception: {ExceptionType} - {Message}",
                exception.GetType().Name, exception.Message);
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }
}

public record ErrorResponse(
    string Code,
    string Message,
    List<ValidationError>? Errors = null
);

public record ValidationError(
    string Field,
    string Message
);
