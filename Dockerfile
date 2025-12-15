# Backend API Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build

# Reduce memory usage during build
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1
ENV DOTNET_NOLOGO=1

WORKDIR /src

# Copy solution and project files
COPY *.slnx ./
COPY src/Domain/*.csproj ./src/Domain/
COPY src/Application/*.csproj ./src/Application/
COPY src/Infrastructure/*.csproj ./src/Infrastructure/
COPY src/Presentation/*.csproj ./src/Presentation/

# Restore dependencies (with reduced parallelism to lower memory usage)
RUN dotnet restore --disable-parallel

# Copy source code
COPY src/ ./src/

# Build and publish
WORKDIR /src/src/Presentation
RUN dotnet publish -c Release -o /app/publish --no-restore

# Runtime image (much smaller ~200MB vs ~2GB SDK)
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Create data directory for SQLite
RUN mkdir -p /app/data

ENV ASPNETCORE_URLS=http://+:80
ENV ConnectionStrings__DefaultConnection="Data Source=/app/data/idolmanagement.db"

EXPOSE 80

ENTRYPOINT ["dotnet", "IdolManagement.Presentation.dll"]
