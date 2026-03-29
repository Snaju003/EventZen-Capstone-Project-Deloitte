namespace BookingService.Services;

public interface IKafkaProducerService
{
    Task<bool> PublishNotificationEventAsync(string eventType, object payload, CancellationToken cancellationToken = default);
}
