function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image"));
    image.src = source;
  });
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const value = String(text || "").trim();
  if (!value) return y;

  const words = value.split(/\s+/);
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(nextLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = nextLine;
    }
  });

  if (line) {
    lines.push(line);
  }

  const slicedLines = lines.slice(0, maxLines);
  slicedLines.forEach((entry, index) => {
    const isLastVisibleLine = index === maxLines - 1 && lines.length > maxLines;
    const rendered = isLastVisibleLine ? `${entry.slice(0, Math.max(0, entry.length - 3))}...` : entry;
    ctx.fillText(rendered, x, y + index * lineHeight);
  });

  return y + slicedLines.length * lineHeight;
}

export async function buildTicketCanvas(selectedTicket, ticketQrCodeUrl) {
  if (!selectedTicket || !ticketQrCodeUrl) {
    throw new Error("Ticket data is not ready yet.");
  }

  const qrImage = await loadImage(ticketQrCodeUrl);
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 700;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to prepare ticket download.");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, canvas.width, 92);

  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(760, 120, 2, 470);

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(40, 120, 690, 470);
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 120, 690, 470);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(800, 120, 360, 470);
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.strokeRect(800, 120, 360, 470);

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 620, canvas.width, 80);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 34px Arial, sans-serif";
  ctx.fillText("EventZen Ticket", 40, 58);

  ctx.font = "500 18px Arial, sans-serif";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText("Valid for one-time venue check-in", 360, 58);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 40px Arial, sans-serif";
  let yCursor = drawWrappedText(ctx, selectedTicket.title, 70, 190, 620, 46, 2);

  ctx.fillStyle = "#334155";
  ctx.font = "600 22px Arial, sans-serif";
  yCursor += 24;
  ctx.fillText(`Booking ID: ${selectedTicket.bookingId}`, 70, yCursor);

  ctx.font = "500 20px Arial, sans-serif";
  yCursor += 54;
  ctx.fillText(`Date: ${selectedTicket.date}`, 70, yCursor);
  yCursor += 42;
  ctx.fillText(`Seats: ${selectedTicket.seats}`, 70, yCursor);
  yCursor += 42;
  ctx.fillText(`Booked on: ${selectedTicket.bookedAt}`, 70, yCursor);

  yCursor += 52;
  ctx.font = "700 24px Arial, sans-serif";
  drawWrappedText(ctx, `Venue: ${selectedTicket.location}`, 70, yCursor, 620, 34, 3);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 36px Arial, sans-serif";
  ctx.fillText(selectedTicket.price, 70, 560);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 24px Arial, sans-serif";
  ctx.fillText("Entry QR", 920, 170);
  ctx.drawImage(qrImage, 855, 205, 250, 250);

  ctx.fillStyle = "#475569";
  ctx.font = "500 16px Arial, sans-serif";
  ctx.fillText("Scan this code at the event gate.", 860, 490);
  ctx.fillText("Do not share publicly.", 860, 516);

  ctx.fillStyle = "#334155";
  ctx.font = "500 16px Arial, sans-serif";
  ctx.fillText("Need help? support@eventzen.com", 40, 666);

  return canvas;
}
