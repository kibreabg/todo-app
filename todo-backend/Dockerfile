FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dev
WORKDIR /src

COPY todo-backend.csproj ./
RUN dotnet restore ./todo-backend.csproj

COPY . ./
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
CMD ["dotnet", "watch", "run", "--no-launch-profile", "--urls", "http://0.0.0.0:8080"]

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY todo-backend.csproj ./
RUN dotnet restore ./todo-backend.csproj

COPY . ./
RUN dotnet publish ./todo-backend.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish ./
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "todo-backend.dll"]
