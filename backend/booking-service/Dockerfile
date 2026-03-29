FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY BookingService.csproj ./
RUN dotnet restore "BookingService.csproj"

COPY . ./
RUN dotnet publish "BookingService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:5000

EXPOSE 5000

ENTRYPOINT ["dotnet", "BookingService.dll"]
