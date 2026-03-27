using BookingService.Configuration;
using BookingService.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace BookingService.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly IMongoCollection<Booking> _bookings;

    public BookingRepository(IMongoClient client, IOptions<MongoDbSettings> settings)
    {
        var db = client.GetDatabase(settings.Value.DatabaseName);
        _bookings = db.GetCollection<Booking>("bookings");
    }

    public async Task<Booking> CreateAsync(Booking booking)
    {
        await _bookings.InsertOneAsync(booking);
        return booking;
    }

    public async Task<List<Booking>> GetByUserIdAsync(string userId)
    {
        return await _bookings.Find(b => b.UserId == userId).SortByDescending(b=>b.BookedAt).ToListAsync();
    }

    public async Task<Booking?> GetByIdAsync(string id)
    {
        return await _bookings.Find(b => b.Id == id).FirstOrDefaultAsync();
    }

    public async Task<bool> CancelAsync(string id)
    {
        var update = Builders<Booking>.Update.Set(b => b.Status, BookingStatuses.Cancelled);
        var result = await _bookings.UpdateOneAsync(b => b.Id == id, update);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> CheckInAsync(string bookingId, string vendorUserId)
    {
        var filter = Builders<Booking>.Filter.And(
            Builders<Booking>.Filter.Eq(b => b.Id, bookingId),
            Builders<Booking>.Filter.Eq(b => b.Status, BookingStatuses.Confirmed)
        );

        var update = Builders<Booking>.Update
            .Set(b => b.Status, BookingStatuses.CheckedIn)
            .Set(b => b.CheckedInAt, DateTime.UtcNow)
            .Set(b => b.CheckedInBy, vendorUserId);

        var result = await _bookings.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    public async Task<List<Booking>> GetByEventIdAsync(string eventId)
    {
        return await _bookings.Find(b => b.EventId == eventId && b.Status == BookingStatuses.Confirmed).ToListAsync();
    }

    public async Task<int> GetConfirmedSeatCountAsync(string eventId)
    {
        var bookings = await _bookings.Find(b => b.EventId == eventId && b.Status == BookingStatuses.Confirmed).ToListAsync();
        return bookings.Sum(b => b.SeatCount);
    }

    public async Task<Dictionary<string, int>> GetConfirmedSeatCountsByEventIdsAsync(IEnumerable<string> eventIds)
    {
        var idList = eventIds
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Distinct(StringComparer.Ordinal)
            .ToList();

        if (idList.Count == 0)
        {
            return new Dictionary<string, int>(StringComparer.Ordinal);
        }

        var filter = Builders<Booking>.Filter.And(
            Builders<Booking>.Filter.In(b => b.EventId, idList),
            Builders<Booking>.Filter.Eq(b => b.Status, BookingStatuses.Confirmed)
        );

        var bookings = await _bookings
            .Find(filter)
            .Project(booking => new { booking.EventId, booking.SeatCount })
            .ToListAsync();

        return bookings
            .GroupBy(item => item.EventId, StringComparer.Ordinal)
            .ToDictionary(
                group => group.Key,
                group => group.Sum(item => item.SeatCount),
                StringComparer.Ordinal
            );
    }
}
