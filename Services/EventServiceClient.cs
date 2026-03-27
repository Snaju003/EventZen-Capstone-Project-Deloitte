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
}
