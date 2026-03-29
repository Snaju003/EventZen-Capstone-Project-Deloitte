using System.ComponentModel.DataAnnotations;

namespace BookingService.DTOs;

public class CreateBookingDto
{
    [Required]
    public string EventId { get; set; } = string.Empty;

    [Range(1,10)]
    public int SeatCount { get; set; }

    public string? TicketTypeId { get; set; }

    public string? TicketTypeName { get; set; }
}
