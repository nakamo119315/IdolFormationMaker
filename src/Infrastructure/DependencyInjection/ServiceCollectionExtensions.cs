using IdolManagement.Application.Formations.Commands;
using IdolManagement.Application.Formations.Queries;
using IdolManagement.Application.Groups.Commands;
using IdolManagement.Application.Groups.Queries;
using IdolManagement.Application.Members.Commands;
using IdolManagement.Application.Members.Queries;
using IdolManagement.Domain.Formations.Repositories;
using IdolManagement.Domain.Groups.Repositories;
using IdolManagement.Domain.Members.Repositories;
using IdolManagement.Infrastructure.Persistence;
using IdolManagement.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace IdolManagement.Infrastructure.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(connectionString));

        services.AddScoped<IMemberRepository, MemberRepository>();
        services.AddScoped<IGroupRepository, GroupRepository>();
        services.AddScoped<IFormationRepository, FormationRepository>();

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Members
        services.AddScoped<CreateMemberHandler>();
        services.AddScoped<UpdateMemberHandler>();
        services.AddScoped<DeleteMemberHandler>();
        services.AddScoped<AddMemberImageHandler>();
        services.AddScoped<DeleteMemberImageHandler>();
        services.AddScoped<GetMemberHandler>();
        services.AddScoped<GetAllMembersHandler>();

        // Groups
        services.AddScoped<CreateGroupHandler>();
        services.AddScoped<UpdateGroupHandler>();
        services.AddScoped<DeleteGroupHandler>();
        services.AddScoped<GetGroupHandler>();
        services.AddScoped<GetAllGroupsHandler>();

        // Formations
        services.AddScoped<CreateFormationHandler>();
        services.AddScoped<UpdateFormationHandler>();
        services.AddScoped<DeleteFormationHandler>();
        services.AddScoped<GetFormationHandler>();
        services.AddScoped<GetAllFormationsHandler>();

        return services;
    }
}
