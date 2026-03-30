# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# Copia arquivos da solução
COPY JMImoveisAPI.sln .
COPY JMImoveisAPI/JMImoveisAPI.csproj JMImoveisAPI/
RUN dotnet restore JMImoveisAPI/JMImoveisAPI.csproj

# Copia o restante do código e publica
COPY . .
WORKDIR /src/JMImoveisAPI
RUN dotnet publish -c Release -o /app/publish

# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 80
ENTRYPOINT ["dotnet", "JMImoveisAPI.dll"]
