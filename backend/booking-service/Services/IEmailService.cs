using BookingService.Models;

namespace BookingService.Services;

public interface IEmailService
{
    Task SendBookingConfirmationAsync(
        Booking booking,
        string userName,
        string userEmail,
        string eventTitle,
        DateTime eventStartTime,
        string venueName
    );
}
