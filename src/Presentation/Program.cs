using FluentValidation;
using FluentValidation.AspNetCore;
using IdolManagement.Application.Members.Validators;
using IdolManagement.Infrastructure.DependencyInjection;
using IdolManagement.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=idolmanagement.db";

builder.Services.AddInfrastructure(connectionString);
builder.Services.AddApplicationServices();

builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateMemberDtoValidator>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseHttpsRedirection();
app.MapControllers();

app.Run();
