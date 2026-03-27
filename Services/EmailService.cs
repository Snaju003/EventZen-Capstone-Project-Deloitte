using BookingService.Configuration;
using BookingService.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using QRCoder;

namespace BookingService.Services;

public class EmailService : IEmailService
{
    private readonly SmtpSettings _smtp;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<SmtpSettings> smtpOptions, ILogger<EmailService> logger)
    {
        _smtp = smtpOptions.Value;
        _logger = logger;
    }

    public async Task SendBookingConfirmationAsync(
        Booking booking,
        string userName,
        string userEmail,
        string eventTitle,
        DateTime eventStartTime,
        string venueName)
    {
        try
        {
            var qrBytes = GenerateQrCode(booking);
            var message = BuildMessage(booking, userName, userEmail, eventTitle, eventStartTime, venueName, qrBytes);

            using var client = new SmtpClient();
            await client.ConnectAsync(_smtp.Host, _smtp.Port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_smtp.User, _smtp.Password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation(
                "Booking confirmation email sent to {Email} for booking {BookingId}",
                userEmail, booking.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to send booking confirmation email to {Email} for booking {BookingId}",
                userEmail, booking.Id);
        }
    }

    private static byte[] GenerateQrCode(Booking booking)
    {
        var qrData = $"EVENTZEN-TICKET|{booking.Id}|{booking.EventId}|{booking.SeatCount}";

        using var generator = new QRCodeGenerator();
        using var qrCodeData = generator.CreateQrCode(qrData, QRCodeGenerator.ECCLevel.M);
        using var qrCode = new PngByteQRCode(qrCodeData);

        return qrCode.GetGraphic(8);
    }

    private MimeMessage BuildMessage(
        Booking booking,
        string userName,
        string userEmail,
        string eventTitle,
        DateTime eventStartTime,
        string venueName,
        byte[] qrPngBytes)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_smtp.DisplayName, _smtp.From));
        message.To.Add(new MailboxAddress(userName, userEmail));
        message.Subject = $"Your Ticket for {eventTitle} — Booking Confirmed!";

        var builder = new BodyBuilder();

        // Embed QR code as inline image
        var qrImage = builder.LinkedResources.Add("ticket-qr.png", qrPngBytes, new ContentType("image", "png"));
        qrImage.ContentId = MimeKit.Utils.MimeUtils.GenerateMessageId();

        var formattedDate = eventStartTime.ToString("dddd, MMMM dd, yyyy 'at' hh:mm tt");
        var formattedBookedAt = booking.BookedAt.ToString("MMMM dd, yyyy 'at' hh:mm tt");

        builder.HtmlBody = BuildHtmlBody(
            booking, userName, eventTitle, formattedDate,
            formattedBookedAt, venueName, qrImage.ContentId);

        builder.TextBody = BuildPlainTextBody(
            booking, userName, eventTitle, formattedDate,
            formattedBookedAt, venueName);

        message.Body = builder.ToMessageBody();

        return message;
    }

    private static string BuildHtmlBody(
        Booking booking,
        string userName,
        string eventTitle,
        string formattedDate,
        string formattedBookedAt,
        string venueName,
        string qrContentId)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset=""utf-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
  <style>
    @media only screen and (max-width: 480px) {{
      .email-outer {{ padding: 16px 8px !important; }}
      .email-card {{ border-radius: 12px !important; }}
      .email-header {{ padding: 24px 20px !important; }}
      .email-header h1 {{ font-size: 20px !important; }}
      .email-body {{ padding: 20px !important; }}
      .ticket-inner {{ padding: 16px !important; }}
      .qr-section {{ padding: 0 20px 20px !important; }}
      .email-footer {{ padding: 20px !important; }}
    }}
  </style>
</head>
<body style=""margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f1f5f9;"">
    <tr>
      <td align=""center"" class=""email-outer"" style=""padding:32px 16px;"">
        <table cellpadding=""0"" cellspacing=""0"" class=""email-card"" style=""background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);width:100%;max-width:560px;"">

          <!-- Header -->
          <tr>
            <td class=""email-header"" style=""background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 40px;text-align:center;"">
              <h1 style=""margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;"">🎟️ Booking Confirmed!</h1>
              <p style=""margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;"">Your ticket is ready</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td class=""email-body"" style=""padding:28px 40px 0;"">
              <p style=""margin:0;color:#334155;font-size:15px;line-height:1.6;word-wrap:break-word;overflow-wrap:break-word;"">
                Hi <strong>{userName}</strong>,<br/>
                Your booking has been confirmed! Here are your ticket details:
              </p>
            </td>
          </tr>

          <!-- Ticket Card -->
          <tr>
            <td class=""email-body"" style=""padding:24px 40px;"">
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;"">
                <tr>
                  <td class=""ticket-inner"" style=""padding:24px;"">
                    <h2 style=""margin:0 0 20px;color:#0f172a;font-size:20px;font-weight:700;word-wrap:break-word;overflow-wrap:break-word;"">{eventTitle}</h2>

                    <!-- Date -->
                    <div style=""margin-bottom:14px;"">
                      <p style=""margin:0 0 2px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;"">📅 Date</p>
                      <p style=""margin:0;color:#1e293b;font-size:14px;font-weight:600;word-wrap:break-word;overflow-wrap:break-word;"">{formattedDate}</p>
                    </div>

                    <!-- Venue -->
                    <div style=""margin-bottom:14px;"">
                      <p style=""margin:0 0 2px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;"">📍 Venue</p>
                      <p style=""margin:0;color:#1e293b;font-size:14px;font-weight:600;word-wrap:break-word;overflow-wrap:break-word;"">{venueName}</p>
                    </div>

                    <!-- Seats -->
                    <div style=""margin-bottom:14px;"">
                      <p style=""margin:0 0 2px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;"">💺 Seats</p>
                      <p style=""margin:0;color:#1e293b;font-size:14px;font-weight:600;"">{booking.SeatCount} {(booking.SeatCount == 1 ? "seat" : "seats")}</p>
                    </div>

                    <!-- Booked At -->
                    <div>
                      <p style=""margin:0 0 2px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;"">🕐 Booked On</p>
                      <p style=""margin:0;color:#1e293b;font-size:14px;font-weight:600;word-wrap:break-word;overflow-wrap:break-word;"">{formattedBookedAt}</p>
                    </div>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QR Code -->
          <tr>
            <td align=""center"" class=""qr-section"" style=""padding:0 40px 24px;"">
              <table cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;border:2px dashed #cbd5e1;border-radius:12px;padding:20px;"">
                <tr>
                  <td align=""center"">
                    <p style=""margin:0 0 12px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;"">Scan at Entry</p>
                    <img src=""cid:{qrContentId}"" alt=""Ticket QR Code"" width=""180"" height=""180"" style=""display:block;border-radius:8px;max-width:100%;height:auto;"" />
                    <p style=""margin:12px 0 0;color:#94a3b8;font-size:11px;"">Show this QR code at the venue entrance</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class=""email-footer"" style=""background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;"">
              <p style=""margin:0;color:#94a3b8;font-size:12px;line-height:1.5;"">
                This is an automatically generated email from EventZen.<br/>
                Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
    }

    private static string BuildPlainTextBody(
        Booking booking,
        string userName,
        string eventTitle,
        string formattedDate,
        string formattedBookedAt,
        string venueName)
    {
        return $@"Booking Confirmed!

Hi {userName},

Your booking has been confirmed! Here are your ticket details:

Event:     {eventTitle}
Date:      {formattedDate}
Venue:     {venueName}
Seats:     {booking.SeatCount}
Booked On: {formattedBookedAt}

Please show your QR code at the venue entrance for check-in.

— EventZen";
    }
}
