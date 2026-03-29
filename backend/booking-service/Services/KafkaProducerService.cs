using System.Text.Json;
using Confluent.Kafka;

namespace BookingService.Services;

public class KafkaProducerService : IKafkaProducerService, IDisposable
{
    private readonly ILogger<KafkaProducerService> _logger;
    private readonly IProducer<string, string>? _producer;
    private readonly bool _enabled;

    public KafkaProducerService(IConfiguration configuration, ILogger<KafkaProducerService> logger)
    {
        _logger = logger;

        var broker = configuration["KAFKA_BROKER"];
        if (string.IsNullOrWhiteSpace(broker))
        {
            _enabled = false;
            return;
        }

        var producerConfig = new ProducerConfig
        {
            BootstrapServers = broker,
            ClientId = configuration["KAFKA_CLIENT_ID"] ?? "eventzen-booking-service",
            Acks = Acks.Leader,
            MessageTimeoutMs = 3000,
            SocketTimeoutMs = 3000,
        };

        try
        {
            _producer = new ProducerBuilder<string, string>(producerConfig).Build();
            _enabled = true;
        }
        catch (Exception ex)
        {
            _enabled = false;
            _logger.LogWarning(ex, "Kafka producer init failed. Continuing without notifications.");
        }
    }

    public async Task<bool> PublishNotificationEventAsync(string eventType, object payload, CancellationToken cancellationToken = default)
    {
        if (!_enabled || _producer == null || string.IsNullOrWhiteSpace(eventType))
        {
            return false;
        }

        var message = new
        {
            eventType,
            timestamp = DateTime.UtcNow.ToString("O"),
            payload,
        };

        try
        {
            var messageJson = JsonSerializer.Serialize(message);
            await _producer.ProduceAsync(eventType, new Message<string, string>
            {
                Key = null,
                Value = messageJson,
            }, cancellationToken);

            _logger.LogInformation("Kafka event published: {Topic}", eventType);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Kafka publish failed for topic {Topic}. Continuing flow.", eventType);
            return false;
        }
    }

    public void Dispose()
    {
        _producer?.Flush(TimeSpan.FromSeconds(2));
        _producer?.Dispose();
    }
}
