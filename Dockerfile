FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build-env
WORKDIR /app

# copy .csproj and restore as distinct layers
COPY "ReactTS.sln" "ReactTS.sln"
COPY "API/API.csproj" "API/API.csproj"
COPY "Application/Application.csproj" "Application/Application.csproj"
COPY "Domain/Domain.csproj" "Domain/Domain.csproj"
COPY "Infrastructure/Infrastructure.csproj" "Infrastructure/Infrastructure.csproj"
COPY "Persistence/Persistence.csproj" "Persistence/Persistence.csproj"

RUN dotnet restore "ReactTS.sln"

# Copy everything else and build
COPY . .
WORKDIR /app
RUN dotnet publish -c Release -o out

# Build a runtime image
FROM mcr.microsoft.com/dotnet/aspnet:5.0
WORKDIR /app
COPY --from=build-env /app/out .
ENTRYPOINT [ "dotnet", "API.dll" ]



