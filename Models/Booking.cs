using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BookingService.Models;

public class Booking
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("user_id")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("event_id")]
    public string EventId { get; set; } = string.Empty;

    [BsonElement("seat_count")]
    public int SeatCount { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = BookingStatuses.Confirmed;

    [BsonElement("booked_at")]
    public DateTime BookedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("checked_in_at")]
    [BsonIgnoreIfNull]
    public DateTime? CheckedInAt { get; set; }

    [BsonElement("checked_in_by")]
    [BsonIgnoreIfNull]
    public string? CheckedInBy { get; set; }
}
