namespace BookingService.DTOs;

public class InternalAttendeeListResponseDto
{
    public string BookingId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
