using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BookingService.Middleware;

public class UserIdentityMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly ConcurrentDictionary<string, long> ReplayCache = new(StringComparer.Ordinal);

    public UserIdentityMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? "/";
        if (!path.StartsWith("/metrics", StringComparison.OrdinalIgnoreCase)
            && !path.StartsWith("/health", StringComparison.OrdinalIgnoreCase)
            && !path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase)
            && !HttpMethods.IsOptions(context.Request.Method))
        {
            var secret = (Environment.GetEnvironmentVariable("INTERNAL_SERVICE_SECRET") ?? string.Empty).Trim();
            if (!string.IsNullOrWhiteSpace(secret))
            {
                var providedSecret = (context.Request.Headers["X-Internal-Secret"].FirstOrDefault() ?? string.Empty).Trim();
                var timestamp = (context.Request.Headers["X-Internal-Timestamp"].FirstOrDefault() ?? string.Empty).Trim();
                var serviceName = (context.Request.Headers["X-Internal-Service"].FirstOrDefault() ?? string.Empty).Trim();
                var signature = (context.Request.Headers["X-Internal-Signature"].FirstOrDefault() ?? string.Empty).Trim();

                if (!string.Equals(providedSecret, secret, StringComparison.Ordinal))
                {
                    await RejectAsync(context, "Invalid internal service secret");
                    return;
                }

                if (string.IsNullOrWhiteSpace(timestamp) || string.IsNullOrWhiteSpace(serviceName) || string.IsNullOrWhiteSpace(signature))
                {
                    await RejectAsync(context, "Internal signature headers are required");
                    return;
                }

                if (!long.TryParse(timestamp, out var timestampMs))
                {
                    await RejectAsync(context, "Invalid internal signature timestamp");
                    return;
                }

                var ttlMs = 60_000L;
                var ttlRaw = Environment.GetEnvironmentVariable("INTERNAL_SIGNATURE_TTL_MS");
                if (long.TryParse(ttlRaw, out var configuredTtl) && configuredTtl > 0)
                {
                    ttlMs = configuredTtl;
                }
                else
                {
                    var appSettingTtlRaw = context.RequestServices
                        .GetService<IConfiguration>()?
                        .GetValue<long?>("InternalSecurity:SignatureTtlMs");
                    if (appSettingTtlRaw.HasValue && appSettingTtlRaw.Value > 0)
                    {
                        ttlMs = appSettingTtlRaw.Value;
                    }
                }

                var nowMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                PurgeExpiredReplayEntries(nowMs);

                if (Math.Abs(nowMs - timestampMs) > ttlMs)
                {
                    await RejectAsync(context, "Internal signature expired");
                    return;
                }

                var method = context.Request.Method.ToUpperInvariant();
                var signedPath = context.Request.Path + context.Request.QueryString.ToString();
                var expectedSignature = CreateSignature(secret, timestamp, method, signedPath, serviceName);

                if (!TimingSafeHexEquals(expectedSignature, signature))
                {
                    await RejectAsync(context, "Invalid internal request signature");
                    return;
                }

                var replayKey = $"{serviceName}:{signature}";
                if (!ReplayCache.TryAdd(replayKey, nowMs + ttlMs))
                {
                    await RejectAsync(context, "Replay request detected");
                    return;
                }
            }
        }

        var userId = context.Request.Headers["X-User-Id"].FirstOrDefault();
        var role = context.Request.Headers["X-User-Role"].FirstOrDefault();

        if (!string.IsNullOrWhiteSpace(userId))
        {
            UserIdentityContext.SetUserId(context, userId);
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            UserIdentityContext.SetUserRole(context, role);
        }

        await _next(context);
    }

    private static string CreateSignature(string secret, string timestamp, string method, string path, string service)
    {
        var payload = $"{timestamp}.{method}.{path}.{service}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var digest = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(digest).ToLowerInvariant();
    }

    private static bool TimingSafeHexEquals(string expectedHex, string providedHex)
    {
        if (expectedHex.Length != providedHex.Length)
        {
            return false;
        }

        var expected = Encoding.UTF8.GetBytes(expectedHex);
        var provided = Encoding.UTF8.GetBytes(providedHex);
        return CryptographicOperations.FixedTimeEquals(expected, provided);
    }

    private static void PurgeExpiredReplayEntries(long nowMs)
    {
        foreach (var item in ReplayCache)
        {
            if (item.Value <= nowMs)
            {
                ReplayCache.TryRemove(item.Key, out _);
            }
        }
    }

    private static Task RejectAsync(HttpContext context, string message)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return context.Response.WriteAsJsonAsync(new
        {
            error = message,
            statusCode = 401,
        });
    }
}
