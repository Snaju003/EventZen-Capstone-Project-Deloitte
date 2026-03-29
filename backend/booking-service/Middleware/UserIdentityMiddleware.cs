namespace BookingService.Middleware;

public class UserIdentityMiddleware
{
    private readonly RequestDelegate _next;

    public UserIdentityMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
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
}
