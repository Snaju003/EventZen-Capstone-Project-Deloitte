using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace BookingService.Services;

public class AuthUserDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class AuthUsersResponse
{
    public List<AuthUserDto> Users { get; set; } = new();
}

public class AuthServiceClient
{
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public AuthServiceClient(HttpClient client)
    {
        _client = client;
    }

    public async Task<Dictionary<string, AuthUserDto>> GetUsersByIdsAsync(IEnumerable<string> userIds)
    {
        var idList = userIds
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Distinct(StringComparer.Ordinal)
            .ToList();

        if (idList.Count == 0)
        {
            return new Dictionary<string, AuthUserDto>(StringComparer.Ordinal);
        }

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "/internal/users/bulk")
            {
                Content = JsonContent.Create(new { userIds = idList }),
            };
            AddInternalSecurityHeaders(request);

            using var response = await _client.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                return new Dictionary<string, AuthUserDto>(StringComparer.Ordinal);
            }

            var payload = await response.Content.ReadFromJsonAsync<AuthUsersResponse>(_jsonOptions);
            var users = payload?.Users ?? new List<AuthUserDto>();

            return users
                .Where(user => !string.IsNullOrWhiteSpace(user.Id))
                .ToDictionary(user => user.Id, user => user, StringComparer.Ordinal);
        }
        catch
        {
            return new Dictionary<string, AuthUserDto>(StringComparer.Ordinal);
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
        var originalPath = request.RequestUri?.OriginalString ?? "/";
        var nonce = Guid.NewGuid().ToString();
        var signedPath = originalPath.Contains('?') ? $"{originalPath}&nonce={nonce}" : $"{originalPath}?nonce={nonce}";
        request.RequestUri = new Uri(signedPath, UriKind.RelativeOrAbsolute);

        var payload = $"{timestamp}.{method}.{signedPath}.{service}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var signatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        var signature = Convert.ToHexString(signatureBytes).ToLowerInvariant();

        request.Headers.TryAddWithoutValidation("X-Internal-Secret", secret);
        request.Headers.TryAddWithoutValidation("X-Internal-Timestamp", timestamp);
        request.Headers.TryAddWithoutValidation("X-Internal-Service", service);
        request.Headers.TryAddWithoutValidation("X-Internal-Signature", signature);
    }

    public async Task<AuthUserDto?> GetUserByIdAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return null;

        var users = await GetUsersByIdsAsync(new[] { userId });
        users.TryGetValue(userId, out var user);
        return user;
    }
}
