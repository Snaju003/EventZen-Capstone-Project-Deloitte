using BookingService.Configuration;
using BookingService.Repositories;
using BookingService.Services;
using BookingService.Middleware;
using MongoDB.Driver;

LoadDotEnv();

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
builder.Services.AddSingleton<IKafkaProducerService, KafkaProducerService>();

builder.Services.Configure<SmtpSettings>(
    builder.Configuration.GetSection("SmtpSettings"));
builder.Services.AddScoped<IEmailService, global::BookingService.Services.EmailService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseMiddleware<UserIdentityMiddleware>();
app.MapControllers();

app.Run();

static void LoadDotEnv()
{
    var candidatePaths = new[]
    {
        Path.Combine(Directory.GetCurrentDirectory(), ".env"),
        Path.Combine(AppContext.BaseDirectory, ".env"),
        Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".env")),
    };

    var envPath = candidatePaths.FirstOrDefault(File.Exists);
    if (string.IsNullOrWhiteSpace(envPath))
    {
        return;
    }

    foreach (var rawLine in File.ReadAllLines(envPath))
    {
        var line = rawLine.Trim();

        if (string.IsNullOrWhiteSpace(line) || line.StartsWith('#'))
        {
            continue;
        }

        var separatorIndex = line.IndexOf('=');
        if (separatorIndex <= 0)
        {
            continue;
        }

        var key = line[..separatorIndex].Trim();
        if (string.IsNullOrWhiteSpace(key))
        {
            continue;
        }

        var value = line[(separatorIndex + 1)..].Trim();
        if ((value.StartsWith('"') && value.EndsWith('"')) || (value.StartsWith('\'') && value.EndsWith('\'')))
        {
            value = value[1..^1];
        }

        if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
        {
            Environment.SetEnvironmentVariable(key, value);
        }
    }
}
