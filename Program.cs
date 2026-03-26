using BookingService.Configuration;
using BookingService.Repositories;
using BookingService.Services;
using BookingService.Middleware;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = builder.Configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>()!;
    return new MongoClient(settings.ConnectionString);
});

builder.Services.AddHttpClient<EventServiceClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["EventServiceBaseUrl"] ?? "http://localhost:8080");
});

builder.Services.AddHttpClient<AuthServiceClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["AuthServiceBaseUrl"] ?? "http://localhost:3001");
});

builder.Services.AddSingleton<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IBookingService, global::BookingService.Services.BookingService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseMiddleware<UserIdentityMiddleware>();
app.MapControllers();

app.Run();
