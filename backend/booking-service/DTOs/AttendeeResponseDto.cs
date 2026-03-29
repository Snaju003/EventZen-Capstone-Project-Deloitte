namespace BookingService.DTOs;

public class AttendeeResponseDto
{
    public string BookingId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public int SeatCount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime BookedAt { get; set; }
}
