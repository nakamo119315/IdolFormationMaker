# Backend API Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy project files
COPY src/Domain/*.csproj ./Domain/
COPY src/Application/*.csproj ./Application/
COPY src/Infrastructure/*.csproj ./Infrastructure/
COPY src/Presentation/*.csproj ./Presentation/

# Restore dependencies
RUN dotnet restore ./Presentation/IdolManagement.Presentation.csproj

# Copy source code
COPY src/ ./

# Build
WORKDIR /src/Presentation
RUN dotnet publish -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Create data directory for SQLite
RUN mkdir -p /app/data

ENV ASPNETCORE_URLS=http://+:80
ENV ConnectionStrings__DefaultConnection="Data Source=/app/data/idolmanagement.db"

EXPOSE 80

ENTRYPOINT ["dotnet", "IdolManagement.Presentation.dll"]
