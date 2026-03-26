using BookingService.DTOs;
using BookingService.Models;

namespace BookingService.Services;

public interface IBookingService
{
    Task<(Booking?,string?,int)> CreateBookingAsync(string userId, CreateBookingDto dto);
    Task<List<BookingResponseDto>> GetMyBookingsAsync(string userId);
    Task<(bool,string?,int)> CancelMyBookingAsync(string bookingId,string userId);
    Task<(bool,string?,int)> AdminCancelBookingAsync(string bookingId);
    Task<List<AttendeeResponseDto>> GetEventAttendeesAsync(string eventId);
    Task<int> GetEventSeatCountAsync(string eventId);
    Task<Dictionary<string, int>> GetEventSeatCountsAsync(string? eventIds);
}
