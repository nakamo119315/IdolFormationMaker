using FluentValidation;
using FluentValidation.AspNetCore;
using IdolManagement.Application.Members.Validators;
using IdolManagement.Infrastructure.DependencyInjection;
using IdolManagement.Infrastructure.Persistence;
using IdolManagement.Presentation.Middlewares;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=idolmanagement.db";

builder.Services.AddInfrastructure(connectionString);
builder.Services.AddApplicationServices();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateMemberDtoValidator>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// グローバル例外ハンドラー
builder.Services.AddTransient<GlobalExceptionHandler>();

// CORS設定: 環境変数 ALLOWED_ORIGINS でカンマ区切りで追加可能
var allowedOrigins = builder.Configuration["AllowedOrigins"]?.Split(',') ?? [];
var defaultOrigins = new[]
{
    "http://localhost:5173",
    "http://localhost:5174",
    "http://192.168.0.23:5173",
    "http://192.168.0.23:5174"
};
var allOrigins = defaultOrigins.Concat(allowedOrigins).Where(o => !string.IsNullOrEmpty(o)).ToArray();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    // 手動マイグレーション: Nickname, CallName カラムを Members テーブルに追加
    try
    {
        var connection = db.Database.GetDbConnection();
        await connection.OpenAsync();
        using var command = connection.CreateCommand();

        // PostgreSQL か SQLite かを判定
        var isPostgres = connection.GetType().Name.Contains("Npgsql", StringComparison.OrdinalIgnoreCase);

        if (isPostgres)
        {
            // PostgreSQL: カラムが存在しない場合のみ追加
            command.CommandText = @"
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Members' AND column_name='Nickname') THEN
                        ALTER TABLE ""Members"" ADD COLUMN ""Nickname"" TEXT;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Members' AND column_name='CallName') THEN
                        ALTER TABLE ""Members"" ADD COLUMN ""CallName"" TEXT;
                    END IF;
                END $$;";
        }
        else
        {
            // SQLite: PRAGMA で確認してからALTER TABLE
            command.CommandText = "PRAGMA table_info(Members)";
            var columns = new List<string>();
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    columns.Add(reader.GetString(1));
                }
            }

            if (!columns.Contains("Nickname"))
            {
                using var alterCmd1 = connection.CreateCommand();
                alterCmd1.CommandText = "ALTER TABLE Members ADD COLUMN Nickname TEXT";
                await alterCmd1.ExecuteNonQueryAsync();
            }
            if (!columns.Contains("CallName"))
            {
                using var alterCmd2 = connection.CreateCommand();
                alterCmd2.CommandText = "ALTER TABLE Members ADD COLUMN CallName TEXT";
                await alterCmd2.ExecuteNonQueryAsync();
            }
        }

        if (isPostgres)
        {
            await command.ExecuteNonQueryAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Migration warning: {ex.Message}");
    }
}

// グローバル例外ハンドラーを最初に配置
app.UseMiddleware<GlobalExceptionHandler>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseHttpsRedirection();
app.MapControllers();

app.Run();
