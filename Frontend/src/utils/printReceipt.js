const escapeHtml = (value) => String(value ?? "N/A")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const printReceipt = ({
  bookingId,
  confirmationNumber,
  property,
  location,
  status = "Confirmed",
  checkIn,
  checkOut,
  guests,
  rooms = 1,
  total,
  currency = "₹",
}) => {
  const printWindow = window.open("", "_blank", "width=800,height=900");

  if (!printWindow) {
    window.alert("Please allow pop-ups to print your receipt.");
    return;
  }

  const guestText = [
    guests?.adults ? `${guests.adults} adult${guests.adults > 1 ? "s" : ""}` : null,
    guests?.children ? `${guests.children} child${guests.children > 1 ? "ren" : ""}` : null,
  ].filter(Boolean).join(", ") || "N/A";

  printWindow.document.write(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>FastBooking Receipt ${escapeHtml(bookingId)}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #f1f5f9; color: #172033; font-family: Arial, sans-serif; }
      .receipt { max-width: 720px; margin: 32px auto; padding: 40px; background: white; border: 1px solid #dbe3ee; }
      header { display: flex; justify-content: space-between; gap: 24px; padding-bottom: 24px; border-bottom: 3px solid #c58a18; }
      h1 { margin: 0; color: #082b5c; font-size: 28px; }
      h2 { margin: 0; color: #082b5c; font-size: 21px; }
      p { margin: 6px 0; }
      .muted { color: #64748b; font-size: 13px; }
      .status { color: #166534; font-weight: 700; text-transform: uppercase; }
      .section { padding: 24px 0; border-bottom: 1px solid #e2e8f0; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
      .label { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
      .value { margin-top: 5px; font-weight: 700; }
      .total { display: flex; justify-content: space-between; margin-top: 24px; padding: 18px; background: #fff8e7; color: #082b5c; font-size: 20px; font-weight: 700; }
      footer { padding-top: 24px; color: #64748b; font-size: 12px; text-align: center; }
      @media print { body { background: white; } .receipt { margin: 0; max-width: none; border: 0; } }
      @media (max-width: 600px) { .receipt { margin: 0; padding: 24px; } .grid { grid-template-columns: 1fr; } }
    </style>
  </head>
  <body>
    <main class="receipt">
      <header>
        <div><h1>FASTBOOKING</h1><p class="muted">Booking receipt</p></div>
        <div class="status">${escapeHtml(status)}</div>
      </header>
      <section class="section">
        <h2>${escapeHtml(property || "Hotel booking")}</h2>
        <p class="muted">${escapeHtml(location)}</p>
      </section>
      <section class="section grid">
        <div><div class="label">Booking ID</div><div class="value">${escapeHtml(bookingId)}</div></div>
        <div><div class="label">Confirmation</div><div class="value">${escapeHtml(confirmationNumber)}</div></div>
        <div><div class="label">Check-in</div><div class="value">${escapeHtml(checkIn)}</div></div>
        <div><div class="label">Check-out</div><div class="value">${escapeHtml(checkOut)}</div></div>
        <div><div class="label">Guests</div><div class="value">${escapeHtml(guestText)}</div></div>
        <div><div class="label">Rooms</div><div class="value">${escapeHtml(rooms)}</div></div>
      </section>
      <div class="total"><span>Total paid</span><span>${escapeHtml(currency)}${escapeHtml(Number(total || 0).toLocaleString("en-IN"))}</span></div>
      <footer>Thank you for booking with FastBooking.</footer>
    </main>
    <script>window.onload = () => { window.focus(); window.print(); };</script>
  </body>
</html>`);
  printWindow.document.close();
};

export default printReceipt;
