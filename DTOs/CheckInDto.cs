using System.ComponentModel.DataAnnotations;

namespace BookingService.DTOs;

public class CheckInDto
{
    [Required]
    public string BookingId { get; set; } = string.Empty;

    [Required]
    public string EventId { get; set; } = string.Empty;
}
