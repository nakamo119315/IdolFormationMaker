# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY *.sln ./
COPY src/Domain/*.csproj ./src/Domain/
COPY src/Application/*.csproj ./src/Application/
COPY src/Infrastructure/*.csproj ./src/Infrastructure/
COPY src/Presentation/*.csproj ./src/Presentation/

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY src/ ./src/

# Build and publish
WORKDIR /src/src/Presentation
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:10000
ENV ASPNETCORE_ENVIRONMENT=Production
# CONNECTION_STRING is set via Render environment variables

EXPOSE 10000

ENTRYPOINT ["dotnet", "IdolManagement.Presentation.dll"]
