namespace BookingService.DTOs;

public class BookingResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string EventId { get; set; } = string.Empty;
    public int SeatCount { get; set; }
    public string? TicketTypeId { get; set; }
    public string? TicketTypeName { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime BookedAt { get; set; }
}