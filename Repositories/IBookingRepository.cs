using BookingService.Models;

namespace BookingService.Repositories;

public interface IBookingRepository
{
    Task<Booking> CreateAsync(Booking booking);
    Task<List<Booking>> GetByUserIdAsync(string userId);
    Task<Booking?> GetByIdAsync(string id);
    Task<bool> CancelAsync(string id);
    Task<List<Booking>> GetByEventIdAsync(string eventId);
    Task<int> GetConfirmedSeatCountAsync(string eventId);
    Task<Dictionary<string, int>> GetConfirmedSeatCountsByEventIdsAsync(IEnumerable<string> eventIds);
}
