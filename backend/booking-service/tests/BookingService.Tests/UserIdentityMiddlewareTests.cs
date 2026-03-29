using BookingService.Middleware;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Cryptography;
using System.Text;
using Xunit;

namespace BookingService.Tests;

public class UserIdentityMiddlewareTests
{
    private static UserIdentityMiddleware CreateMiddleware()
    {
        return new UserIdentityMiddleware(_ => Task.CompletedTask);
    }

    private static DefaultHttpContext CreateContextWithConfig(long signatureTtlMs = 60000)
    {
        var context = new DefaultHttpContext();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["InternalSecurity:SignatureTtlMs"] = signatureTtlMs.ToString()
            })
            .Build();

        var services = new ServiceCollection();
        services.AddSingleton<IConfiguration>(configuration);
        context.RequestServices = services.BuildServiceProvider();
        return context;
    }

    private static string BuildSignature(string secret, string timestamp, string method, string path, string service)
    {
        var payload = $"{timestamp}.{method}.{path}.{service}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var digest = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(digest).ToLowerInvariant();
    }

    [Fact]
    public async Task InvokeAsync_SetsUserIdentityItems_WhenHeadersArePresent()
    {
        Environment.SetEnvironmentVariable("INTERNAL_SERVICE_SECRET", null);

        var middleware = CreateMiddleware();
        var context = CreateContextWithConfig();
        context.Request.Headers["X-User-Id"] = "user-123";
        context.Request.Headers["X-User-Role"] = "admin";

        await middleware.InvokeAsync(context);

        Assert.Equal("user-123", UserIdentityContext.GetUserId(context));
        Assert.Equal("admin", UserIdentityContext.GetUserRole(context));
    }

    [Fact]
    public async Task InvokeAsync_DoesNotSetUserIdentityItems_WhenHeadersAreMissing()
    {
        Environment.SetEnvironmentVariable("INTERNAL_SERVICE_SECRET", null);

        var middleware = CreateMiddleware();
        var context = CreateContextWithConfig();

        await middleware.InvokeAsync(context);

        Assert.Null(UserIdentityContext.GetUserId(context));
        Assert.Null(UserIdentityContext.GetUserRole(context));
    }

    [Fact]
    public async Task InvokeAsync_Blocks_WhenInternalSecretIsConfiguredAndHeadersMissing()
    {
        Environment.SetEnvironmentVariable("INTERNAL_SERVICE_SECRET", "test-secret");
        Environment.SetEnvironmentVariable("INTERNAL_SIGNATURE_TTL_MS", "60000");

        var middleware = CreateMiddleware();
        var context = CreateContextWithConfig();

        await middleware.InvokeAsync(context);

        Assert.Equal(StatusCodes.Status401Unauthorized, context.Response.StatusCode);
    }

    [Fact]
    public async Task InvokeAsync_AllowsSignedInternalRequest()
    {
        Environment.SetEnvironmentVariable("INTERNAL_SERVICE_SECRET", "test-secret");
        Environment.SetEnvironmentVariable("INTERNAL_SIGNATURE_TTL_MS", "60000");

        var middleware = CreateMiddleware();
        var context = CreateContextWithConfig();
        context.Request.Method = HttpMethods.Get;
        context.Request.Path = "/bookings/event/evt-1/count";

        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
        var serviceName = "event-service";
        var signature = BuildSignature("test-secret", timestamp, "GET", "/bookings/event/evt-1/count", serviceName);

        context.Request.Headers["X-Internal-Secret"] = "test-secret";
        context.Request.Headers["X-Internal-Timestamp"] = timestamp;
        context.Request.Headers["X-Internal-Service"] = serviceName;
        context.Request.Headers["X-Internal-Signature"] = signature;
        context.Request.Headers["X-User-Id"] = "event-service";
        context.Request.Headers["X-User-Role"] = "admin";

        await middleware.InvokeAsync(context);

        Assert.Equal("event-service", UserIdentityContext.GetUserId(context));
        Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode);
    }

    [Fact]
    public async Task InvokeAsync_BlocksReplayOfSameSignature()
    {
        Environment.SetEnvironmentVariable("INTERNAL_SERVICE_SECRET", "test-secret");
        Environment.SetEnvironmentVariable("INTERNAL_SIGNATURE_TTL_MS", "60000");

        var middleware = CreateMiddleware();
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
        var serviceName = "event-service";
        var path = "/bookings/event/evt-1/count";
        var signature = BuildSignature("test-secret", timestamp, "GET", path, serviceName);

        var context1 = CreateContextWithConfig();
        context1.Request.Method = HttpMethods.Get;
        context1.Request.Path = path;
        context1.Request.Headers["X-Internal-Secret"] = "test-secret";
        context1.Request.Headers["X-Internal-Timestamp"] = timestamp;
        context1.Request.Headers["X-Internal-Service"] = serviceName;
        context1.Request.Headers["X-Internal-Signature"] = signature;
        context1.Request.Headers["X-User-Id"] = "event-service";
        context1.Request.Headers["X-User-Role"] = "admin";

        await middleware.InvokeAsync(context1);
        Assert.Equal(StatusCodes.Status200OK, context1.Response.StatusCode);

        var context2 = CreateContextWithConfig();
        context2.Request.Method = HttpMethods.Get;
        context2.Request.Path = path;
        context2.Request.Headers["X-Internal-Secret"] = "test-secret";
        context2.Request.Headers["X-Internal-Timestamp"] = timestamp;
        context2.Request.Headers["X-Internal-Service"] = serviceName;
        context2.Request.Headers["X-Internal-Signature"] = signature;
        context2.Request.Headers["X-User-Id"] = "event-service";
        context2.Request.Headers["X-User-Role"] = "admin";

        await middleware.InvokeAsync(context2);
        Assert.Equal(StatusCodes.Status401Unauthorized, context2.Response.StatusCode);
    }
}
