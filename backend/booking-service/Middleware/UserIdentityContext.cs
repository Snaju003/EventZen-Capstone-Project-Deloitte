namespace BookingService.Middleware;

public static class UserIdentityContext
{
    public const string UserIdItemKey = "UserId";
    public const string UserRoleItemKey = "UserRole";

    public static void SetUserId(HttpContext context, string userId)
    {
        context.Items[UserIdItemKey] = userId;
    }

    public static void SetUserRole(HttpContext context, string role)
    {
        context.Items[UserRoleItemKey] = role;
    }

    public static string? GetUserId(HttpContext context)
    {
        return context.Items[UserIdItemKey]?.ToString();
    }

    public static string? GetUserRole(HttpContext context)
    {
        return context.Items[UserRoleItemKey]?.ToString();
    }
}
