using BookingService.DTOs;
using BookingService.Models;
using BookingService.Repositories;

namespace BookingService.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _repo;
    private readonly EventServiceClient _eventClient;
    private readonly AuthServiceClient _authClient;
    private readonly IEmailService _emailService;
    private readonly IKafkaProducerService _kafkaProducerService;
    private readonly ILogger<BookingService> _logger;

    public BookingService(
        IBookingRepository repo,
        EventServiceClient eventClient,
        AuthServiceClient authClient,
        IEmailService emailService,
        IKafkaProducerService kafkaProducerService,
        ILogger<BookingService> logger)
    {
        _repo = repo;
        _eventClient = eventClient;
        _authClient = authClient;
        _emailService = emailService;
        _kafkaProducerService = kafkaProducerService;
        _logger = logger;
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
            TicketTypeId = dto.TicketTypeId,
            TicketTypeName = dto.TicketTypeName,
            Status = BookingStatuses.Confirmed,
            BookedAt = DateTime.UtcNow
        };

        var created = await _repo.CreateAsync(booking);

        _ = Task.Run(async () =>
        {
            try
            {
                var published = await _kafkaProducerService.PublishNotificationEventAsync("booking.confirmed", new
                {
                    userId = created.UserId,
                    eventId = created.EventId,
                    eventTitle = eventDetails.Title,
                    bookingId = created.Id,
                });

                if (!published)
                {
                    _logger.LogWarning("Kafka event {EventType} was not published for booking {BookingId}", "booking.confirmed", created.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Error in fire-and-forget kafka publish for booking.confirmed, booking {BookingId}",
                    created.Id);
            }
        });

        // Fire-and-forget: send booking confirmation email
        _ = Task.Run(async () =>
        {
            try
            {
                var user = await _authClient.GetUserByIdAsync(userId);
                if (user == null || string.IsNullOrWhiteSpace(user.Email))
                {
                    _logger.LogWarning(
                        "Skipping confirmation email for booking {BookingId}: user not found",
                        created.Id);
                    return;
                }

                await _emailService.SendBookingConfirmationAsync(
                    created,
                    user.Name,
                    user.Email,
                    eventDetails.Title,
                    eventDetails.StartTime,
                    eventDetails.Venue?.Name ?? "Venue TBA"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error in fire-and-forget email task for booking {BookingId}",
                    created.Id);
            }
        });

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

        _ = Task.Run(async () =>
        {
            try
            {
                var published = await _kafkaProducerService.PublishNotificationEventAsync("booking.cancelled", new
                {
                    userId = booking.UserId,
                    eventId = booking.EventId,
                    eventTitle = eventDetails.Title,
                    bookingId = booking.Id,
                });

                if (!published)
                {
                    _logger.LogWarning("Kafka event {EventType} was not published for booking {BookingId}", "booking.cancelled", booking.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Error in fire-and-forget kafka publish for booking.cancelled, booking {BookingId}",
                    booking.Id);
            }
        });

        return (true, null, 200);
    }

    public async Task<(bool,string?,int)> AdminCancelBookingAsync(string bookingId)
    {
        var booking = await _repo.GetByIdAsync(bookingId);

        if (booking == null) return Failure("Booking not found", 404);
        if (booking.Status == BookingStatuses.Cancelled) return Failure("Already cancelled", 400);

        await _repo.CancelAsync(bookingId);

        _ = Task.Run(async () =>
        {
            try
            {
                var eventDetails = await _eventClient.GetEventAsync(booking.EventId);

                var published = await _kafkaProducerService.PublishNotificationEventAsync("booking.admin-cancelled", new
                {
                    userId = booking.UserId,
                    eventId = booking.EventId,
                    eventTitle = eventDetails?.Title ?? "Event",
                    bookingId = booking.Id,
                });

                if (!published)
                {
                    _logger.LogWarning("Kafka event {EventType} was not published for booking {BookingId}", "booking.admin-cancelled", booking.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Error in fire-and-forget kafka publish for booking.admin-cancelled, booking {BookingId}",
                    booking.Id);
            }
        });

        return (true, null, 200);
    }

    public async Task<(bool, string?, int, object?)> CheckInAsync(string bookingId, string eventId, string vendorUserId)
    {
        var booking = await _repo.GetByIdAsync(bookingId);

        if (booking == null)
            return (false, "Booking not found", 404, null);

        if (booking.EventId != eventId)
            return (false, "This ticket does not belong to this event", 400, null);

        if (booking.Status == BookingStatuses.Cancelled)
            return (false, "This booking has been cancelled", 400, null);

        if (booking.Status == BookingStatuses.CheckedIn)
            return (false, "This ticket has already been checked in", 409, null);

        if (booking.Status != BookingStatuses.Confirmed)
            return (false, "Invalid booking status for check-in", 400, null);

        var updated = await _repo.CheckInAsync(bookingId, vendorUserId);
        if (!updated)
            return (false, "Check-in failed — ticket may have already been scanned", 409, null);

        _ = Task.Run(async () =>
        {
            try
            {
                var eventDetails = await _eventClient.GetEventAsync(eventId);

                var published = await _kafkaProducerService.PublishNotificationEventAsync("booking.checked-in", new
                {
                    userId = booking.UserId,
                    eventId = booking.EventId,
                    eventTitle = eventDetails?.Title ?? "Event",
                    bookingId = booking.Id,
                    checkedInBy = vendorUserId,
                });

                if (!published)
                {
                    _logger.LogWarning("Kafka event {EventType} was not published for booking {BookingId}", "booking.checked-in", booking.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Error in fire-and-forget kafka publish for booking.checked-in, booking {BookingId}",
                    booking.Id);
            }
        });

        // Fetch attendee name for the vendor's scanner success screen
        var user = await _authClient.GetUserByIdAsync(booking.UserId);

        return (true, null, 200, new
        {
            message = "Check-in successful",
            attendeeName = user?.Name ?? "Attendee",
            seatCount = booking.SeatCount,
            bookingId = booking.Id,
        });
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

    public async Task<List<InternalAttendeeListResponseDto>> GetEventAttendeeUsersInternalAsync(string eventId)
    {
        var bookings = await _repo.GetByEventIdAsync(eventId);

        return bookings.Select(booking => new InternalAttendeeListResponseDto
        {
            BookingId = booking.Id,
            UserId = booking.UserId,
            EventId = booking.EventId,
            Status = booking.Status,
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
            TicketTypeId = booking.TicketTypeId,
            TicketTypeName = booking.TicketTypeName,
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
