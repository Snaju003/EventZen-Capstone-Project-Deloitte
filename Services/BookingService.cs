using BookingService.DTOs;
using BookingService.Models;
using BookingService.Repositories;

namespace BookingService.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _repo;
    private readonly EventServiceClient _eventClient;
    private readonly AuthServiceClient _authClient;

    public BookingService(IBookingRepository repo, EventServiceClient eventClient, AuthServiceClient authClient)
    {
        _repo = repo;
        _eventClient = eventClient;
        _authClient = authClient;
    }

    public async Task<(Booking?,string?,int)> CreateBookingAsync(string userId, CreateBookingDto dto)
    {
        var eventDetails = await _eventClient.GetEventAsync(dto.EventId);

        if (eventDetails == null) return BookingFailure("Event not found", 404);
        if (eventDetails.Status != "published") return BookingFailure("Event not open for booking", 400);

        var confirmed = await _repo.GetConfirmedSeatCountAsync(dto.EventId);
        var available = eventDetails.MaxAttendees - confirmed;

        if (dto.SeatCount > available)
            return BookingFailure($"Only {available} seats available", 409);

        var booking = new Booking
        {
            UserId = userId,
            EventId = dto.EventId,
            SeatCount = dto.SeatCount,
            Status = BookingStatuses.Confirmed,
            BookedAt = DateTime.UtcNow
        };

        var created = await _repo.CreateAsync(booking);
        return (created, null, 201);
    }

    public async Task<List<BookingResponseDto>> GetMyBookingsAsync(string userId)
    {
        var bookings = await _repo.GetByUserIdAsync(userId);
        return bookings.Select(ToBookingResponse).ToList();
    }

    public async Task<(bool,string?,int)> CancelMyBookingAsync(string bookingId,string userId)
    {
        var booking = await _repo.GetByIdAsync(bookingId);

        if (booking == null) return Failure("Booking not found", 404);
        if (booking.UserId != userId) return Failure("Forbidden", 403);
        if (booking.Status == BookingStatuses.Cancelled) return Failure("Already cancelled", 400);

        var eventDetails = await _eventClient.GetEventAsync(booking.EventId);
        if(eventDetails == null)
            return Failure("Unable to validate event timing right now", 503);

        if (eventDetails.StartTime <= DateTime.UtcNow)
            return Failure("Bookings can only be cancelled before the event starts", 409);

        await _repo.CancelAsync(bookingId);
        return (true, null, 200);
    }

    public async Task<(bool,string?,int)> AdminCancelBookingAsync(string bookingId)
    {
        var booking = await _repo.GetByIdAsync(bookingId);

        if (booking == null) return Failure("Booking not found", 404);
        if (booking.Status == BookingStatuses.Cancelled) return Failure("Already cancelled", 400);

        await _repo.CancelAsync(bookingId);
        return (true, null, 200);
    }

    public async Task<List<AttendeeResponseDto>> GetEventAttendeesAsync(string eventId)
    {
        var bookings = await _repo.GetByEventIdAsync(eventId);
        var usersById = await _authClient.GetUsersByIdsAsync(bookings.Select(booking => booking.UserId));

        return bookings.Select(booking =>
        {
            usersById.TryGetValue(booking.UserId, out var user);

            return new AttendeeResponseDto
            {
                BookingId = booking.Id,
                UserId = booking.UserId,
                UserName = user?.Name ?? string.Empty,
                UserEmail = user?.Email ?? string.Empty,
                EventId = booking.EventId,
                SeatCount = booking.SeatCount,
                Status = booking.Status,
                BookedAt = booking.BookedAt,
            };
        }).ToList();
    }

    public async Task<int> GetEventSeatCountAsync(string eventId)
    {
        return await _repo.GetConfirmedSeatCountAsync(eventId);
    }

    public async Task<Dictionary<string, int>> GetEventSeatCountsAsync(string? eventIds)
    {
        var normalizedEventIds = ParseEventIds(eventIds);
        return await _repo.GetConfirmedSeatCountsByEventIdsAsync(normalizedEventIds);
    }

    private static List<string> ParseEventIds(string? eventIds)
    {
        return (eventIds ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Distinct(StringComparer.Ordinal)
            .ToList();
    }

    private static BookingResponseDto ToBookingResponse(Booking booking)
    {
        return new BookingResponseDto
        {
            Id = booking.Id,
            EventId = booking.EventId,
            SeatCount = booking.SeatCount,
            Status = booking.Status,
            BookedAt = booking.BookedAt,
        };
    }

    private static (Booking?, string?, int) BookingFailure(string error, int statusCode)
    {
        return (null, error, statusCode);
    }

    private static (bool, string?, int) Failure(string error, int statusCode)
    {
        return (false, error, statusCode);
    }
}
