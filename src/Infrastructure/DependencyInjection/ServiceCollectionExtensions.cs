using IdolManagement.Application.Conversations.Commands;
using IdolManagement.Application.Conversations.Queries;
using IdolManagement.Application.Data.Queries;
using IdolManagement.Infrastructure.Data;
using IdolManagement.Application.Formations.Commands;
using IdolManagement.Application.Formations.Queries;
using IdolManagement.Application.Groups.Commands;
using IdolManagement.Application.Groups.Queries;
using IdolManagement.Application.Members.Commands;
using IdolManagement.Application.Members.Queries;
using IdolManagement.Application.Setlists.Commands;
using IdolManagement.Application.Setlists.Queries;
using IdolManagement.Application.Songs.Commands;
using IdolManagement.Application.Songs.Queries;
using IdolManagement.Domain.Conversations.Repositories;
using IdolManagement.Domain.Formations.Repositories;
using IdolManagement.Domain.Groups.Repositories;
using IdolManagement.Domain.Members.Repositories;
using IdolManagement.Domain.Setlists.Repositories;
using IdolManagement.Domain.Songs.Repositories;
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
            options.UseNpgsql(connectionString));

        services.AddScoped<IMemberRepository, MemberRepository>();
        services.AddScoped<IGroupRepository, GroupRepository>();
        services.AddScoped<IFormationRepository, FormationRepository>();
        services.AddScoped<ISongRepository, SongRepository>();
        services.AddScoped<ISetlistRepository, SetlistRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Members
        services.AddScoped<CreateMemberHandler>();
        services.AddScoped<UpdateMemberHandler>();
        services.AddScoped<DeleteMemberHandler>();
        services.AddScoped<DeleteMembersBulkHandler>();
        services.AddScoped<AddMemberImageHandler>();
        services.AddScoped<DeleteMemberImageHandler>();
        services.AddScoped<GetMemberHandler>();
        services.AddScoped<GetAllMembersHandler>();
        services.AddScoped<GetMembersPagedHandler>();
        services.AddScoped<ExportMembersCsvHandler>();

        // Groups
        services.AddScoped<CreateGroupHandler>();
        services.AddScoped<UpdateGroupHandler>();
        services.AddScoped<DeleteGroupHandler>();
        services.AddScoped<DeleteGroupsBulkHandler>();
        services.AddScoped<GetGroupHandler>();
        services.AddScoped<GetAllGroupsHandler>();
        services.AddScoped<GetGroupsPagedHandler>();

        // Formations
        services.AddScoped<CreateFormationHandler>();
        services.AddScoped<UpdateFormationHandler>();
        services.AddScoped<DeleteFormationHandler>();
        services.AddScoped<GetFormationHandler>();
        services.AddScoped<GetAllFormationsHandler>();

        // Songs
        services.AddScoped<CreateSongHandler>();
        services.AddScoped<UpdateSongHandler>();
        services.AddScoped<DeleteSongHandler>();
        services.AddScoped<DeleteSongsBulkHandler>();
        services.AddScoped<GetSongHandler>();
        services.AddScoped<GetAllSongsHandler>();
        services.AddScoped<GetSongsByGroupHandler>();
        services.AddScoped<GetSongsPagedHandler>();
        services.AddScoped<ExportSongsCsvHandler>();

        // Setlists
        services.AddScoped<CreateSetlistHandler>();
        services.AddScoped<UpdateSetlistHandler>();
        services.AddScoped<DeleteSetlistHandler>();
        services.AddScoped<GetSetlistHandler>();
        services.AddScoped<GetAllSetlistsHandler>();
        services.AddScoped<GetSetlistsByGroupHandler>();

        // Conversations
        services.AddScoped<CreateConversationHandler>();
        services.AddScoped<UpdateConversationHandler>();
        services.AddScoped<DeleteConversationHandler>();
        services.AddScoped<AddMessageHandler>();
        services.AddScoped<GetConversationHandler>();
        services.AddScoped<GetAllConversationsHandler>();

        // Data Export/Import
        services.AddScoped<ExportDataHandler>();
        services.AddScoped<ImportDataHandler>();

        return services;
    }
}
