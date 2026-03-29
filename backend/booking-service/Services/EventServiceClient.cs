using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace BookingService.Services;

public class EventVenueDetails
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

public class EventDetails
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int MaxAttendees { get; set; }
    public DateTime StartTime { get; set; }
    public double TicketPrice { get; set; }
    public EventVenueDetails? Venue { get; set; }
}

public class EventServiceClient
{
    private readonly HttpClient _client;

    public EventServiceClient(HttpClient client)
    {
        _client = client;
    }

    public async Task<EventDetails?> GetEventAsync(string eventId)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"/events/{eventId}");
            AddInternalSecurityHeaders(request);
            var res = await _client.SendAsync(request);
            if (!res.IsSuccessStatusCode) return null;

            var json = await res.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<EventDetails>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch
        {
            return null;
        }
    }

    private static void AddInternalSecurityHeaders(HttpRequestMessage request)
    {
        var secret = Environment.GetEnvironmentVariable("INTERNAL_SERVICE_SECRET")?.Trim();
        if (string.IsNullOrWhiteSpace(secret))
        {
            return;
        }

        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
        var service = Environment.GetEnvironmentVariable("INTERNAL_CALLER_NAME")?.Trim();
        if (string.IsNullOrWhiteSpace(service))
        {
            service = "booking-service";
        }

        var method = request.Method.Method.ToUpperInvariant();
        var path = request.RequestUri?.PathAndQuery;
        if (string.IsNullOrWhiteSpace(path))
        {
            path = "/";
        }

        var payload = $"{timestamp}.{method}.{path}.{service}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var signatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        var signature = Convert.ToHexString(signatureBytes).ToLowerInvariant();

        request.Headers.TryAddWithoutValidation("X-Internal-Secret", secret);
        request.Headers.TryAddWithoutValidation("X-Internal-Timestamp", timestamp);
        request.Headers.TryAddWithoutValidation("X-Internal-Service", service);
        request.Headers.TryAddWithoutValidation("X-Internal-Signature", signature);
    }
}
