using BookingService.Middleware;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace BookingService.Tests;

public class UserIdentityMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_SetsUserIdentityItems_WhenHeadersArePresent()
    {
        var middleware = new UserIdentityMiddleware(_ => Task.CompletedTask);
        var context = new DefaultHttpContext();
        context.Request.Headers["X-User-Id"] = "user-123";
        context.Request.Headers["X-User-Role"] = "admin";

        await middleware.InvokeAsync(context);

        Assert.Equal("user-123", UserIdentityContext.GetUserId(context));
        Assert.Equal("admin", UserIdentityContext.GetUserRole(context));
    }

    [Fact]
    public async Task InvokeAsync_DoesNotSetUserIdentityItems_WhenHeadersAreMissing()
    {
        var middleware = new UserIdentityMiddleware(_ => Task.CompletedTask);
        var context = new DefaultHttpContext();

        await middleware.InvokeAsync(context);

        Assert.Null(UserIdentityContext.GetUserId(context));
        Assert.Null(UserIdentityContext.GetUserRole(context));
    }
}
