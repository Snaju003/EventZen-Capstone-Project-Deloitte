using BookingService.DTOs;
using BookingService.Middleware;
using BookingService.Services;
using Microsoft.AspNetCore.Mvc;

namespace BookingService.Controllers;

[ApiController]
[Route("bookings")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _service;

    public BookingsController(IBookingService service)
    {
        _service = service;
    }

    private string? UserId => UserIdentityContext.GetUserId(HttpContext);
    private string? Role => UserIdentityContext.GetUserRole(HttpContext);

    [HttpPost]
    public async Task<IActionResult> CreateBooking(CreateBookingDto dto)
    {
        if(UserId==null) return Unauthorized();

        var (booking,error,code) = await _service.CreateBookingAsync(UserId,dto);

        if(error!=null) return StatusCode(code,new{error, statusCode=code});

        return StatusCode(201,booking);
    }

    [HttpGet("me")]
    public async Task<IActionResult> MyBookings()
    {
        if(UserId==null) return Unauthorized();

        var bookings = await _service.GetMyBookingsAsync(UserId);
        return Ok(bookings);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Cancel(string id)
    {
        if(UserId==null) return Unauthorized();

        var (success,error,code) = await _service.CancelMyBookingAsync(id,UserId);

        if(!success) return StatusCode(code,new{error,statusCode=code});

        return Ok(new{message="Booking cancelled"});
    }

    [HttpGet("event/{eventId}")]
    public async Task<IActionResult> GetAttendees(string eventId)
    {
        if(Role!="admin") return StatusCode(403,new{error="Admins only"});

        var attendees = await _service.GetEventAttendeesAsync(eventId);
        return Ok(attendees);
    }

    [HttpGet("event/{eventId}/count")]
    public async Task<IActionResult> GetSeatCount(string eventId)
    {
        if(UserId==null) return Unauthorized();

        var count = await _service.GetEventSeatCountAsync(eventId);
        return Ok(new{eventId,confirmedSeats=count});
    }

    [HttpGet("events/counts")]
    public async Task<IActionResult> GetSeatCounts([FromQuery] string? eventIds)
    {
        if (UserId == null) return Unauthorized();

        var counts = await _service.GetEventSeatCountsAsync(eventIds);

        return Ok(new { counts });
    }

    [HttpDelete("{id}/admin")]
    public async Task<IActionResult> AdminCancel(string id)
    {
        if(Role!="admin") return StatusCode(403,new{error="Admins only", statusCode=403});

        var (success,error,code) = await _service.AdminCancelBookingAsync(id);

        if(!success) return StatusCode(code,new{error,statusCode=code});

        return Ok(new{message="Booking cancelled by admin"});
    }

    [HttpPost("check-in")]
    public async Task<IActionResult> CheckIn(CheckInDto dto)
    {
        if(UserId==null) return Unauthorized();
        if(Role!="vendor" && Role!="admin")
            return StatusCode(403,new{error="Only vendors and admins can check in attendees", statusCode=403});

        var (success,error,code,data) = await _service.CheckInAsync(dto.BookingId, dto.EventId, UserId);

        if(!success) return StatusCode(code,new{error,statusCode=code});

        return Ok(data);
    }
}
