import jsPDF from "jspdf";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserBookings } from "../redux/slices/userSlice";

function TicketModal({ ticket, onClose }) {
  if (!ticket) return null;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(ticket.title, 20, 20);
    doc.setFontSize(12);
    doc.text(`Booking ID: ${ticket.code}`, 20, 40);
    doc.text(`Date: ${new Date(ticket.date).toLocaleString()}`, 20, 50);
    doc.text(`Venue: ${ticket.venue}`, 20, 60);
    doc.text(
      `Seats: ${ticket.seats
        .map((s) => `${s.section} • ${s.seatIds.join(", ")}`)
        .join(" | ")}`,
      20,
      70
    );
    doc.text(`Total Paid: ₹${ticket.totalAmount}`, 20, 85);

    const canvas = document.querySelector("#ticket-qr");
    if (canvas) {
      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", 150, 20, 40, 40);
    }
    doc.save(`Ticket_${ticket.code}.pdf`);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-1200 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-200 flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gray-800/70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-900 transition cursor-pointer"
        >
          ✕
        </button>

        {/* Left: QR Code */}
        <div className="flex-none p-6 bg-gray-50 flex items-center justify-center rounded-l-3xl">
          <QRCodeCanvas
            id="ticket-qr"
            value={ticket.code}
            size={180}
            fgColor="#1e1e24"
            level="H"
            className="shadow-lg rounded-xl p-2 bg-white"
          />
        </div>

        {/* Right: Info */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {ticket.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(ticket.date).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}{" "}
                {new Date(
                  `1970-01-01T${ticket.startTime}:00`
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
              <div className="flex items-center gap-2 mt-2 text-gray-600">
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="#e91e63"
                  strokeWidth="1.7"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2a7 7 0 0 1 7 7c0 4.5-7 13-7 13S5 13.5 5 9a7 7 0 0 1 7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <p className="text-sm font-medium">{ticket.venue}</p>
              </div>
            </div>

            {/* Booking Info */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Booking ID
              </p>
              <p className="text-sm font-mono font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded mt-1 inline-block">
                {ticket.code}
              </p>
            </div>

            {/* Seats */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Seats
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {ticket.seats.map((s, i) => (
                  <span
                    key={i}
                    className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-sm font-semibold shadow-sm"
                  >
                    {s.section} • {s.seatIds.join(", ")}
                  </span>
                ))}
              </div>
            </div>

            {/* Total Paid */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Total Paid
              </p>
              <p className="text-purple-700 font-bold text-lg">
                ₹{ticket.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={downloadPDF}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#9c27b0] to-[#e91e63] text-white font-semibold shadow hover:scale-105 transition cursor-pointer"
            >
              Download Ticket
            </button>
            <button
              onClick={() => {
                navigator.share
                  ? navigator.share({
                      title: "My Event Ticket",
                      text: `Here’s my ticket for ${ticket.title}`,
                      url: window.location.href,
                    })
                  : alert("Sharing not supported on this device");
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold shadow hover:bg-gray-300 transition cursor-pointer"
            >
              Share
            </button>
          </div>

          {/* Terms */}
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <p>No cancellations or refunds allowed.</p>
            <p>Entry closes 15 minutes before the event starts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketCard({ ticket, onOpen }) {
  const isPast = ticket.status === "past";

  return (
    <div
      className={`relative flex bg-white rounded-2xl border border-[#e5e5e5] shadow-sm mb-6 max-w-3xl w-full mx-auto overflow-hidden 
                  transition-all duration-200 hover:shadow-lg ${
                    isPast ? "opacity-70" : ""
                  }`}
    >
      {/* Left: Event Image */}
      <div className="relative min-w-[140px] max-w-[200px] flex-shrink-0">
        <img
          src={ticket.image || "/default-event.jpg"}
          alt={ticket.title}
          className={`h-full w-full object-cover ${
            isPast ? "grayscale brightness-90" : ""
          }`}
        />
      </div>

      {/* Right */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div className="px-6 py-5">
          <h3
            className={`truncate font-bold text-xl mb-2 ${
              isPast ? "text-gray-500" : "text-[#1e1e24]"
            }`}
          >
            {ticket.title}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            {new Date(ticket.date).toLocaleDateString(undefined, {
              dateStyle: "medium",
            })}{" "}
            {new Date(`1970-01-01T${ticket.startTime}:00`).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }
            )}
          </p>
          <p className="text-sm text-gray-600 mb-2">📍 {ticket.venue}</p>

          <div className="flex flex-wrap gap-2 text-sm mt-2">
            <span className="bg-[#f5f5f5] text-[#444] px-2 py-0.5 rounded-md font-mono font-medium text-xs shadow-sm">
              Booking #{ticket.code}
            </span>
            {ticket.seats.map((s, i) => (
              <span
                key={i}
                className="bg-[#ede7f6] text-[#673ab7] px-2 py-0.5 rounded-md font-semibold text-xs shadow-sm"
              >
                {s.section} • {s.seatIds.join(", ")}
              </span>
            ))}
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-end px-6 py-4">
          <button
            onClick={() => !isPast && onOpen(ticket)}
            className={`rounded-lg px-5 py-2 text-sm font-semibold shadow 
                ${
                  isPast
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#9c27b0] to-[#e91e63] text-white hover:scale-105 hover:shadow-md transition cursor-pointer"
                }`}
            disabled={isPast}
          >
            {isPast ? "View Details" : "Open Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyTicketsStyled() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { userBookings } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserBookings()).unwrap();
  }, [dispatch]);

  useEffect(() => {
    const now = new Date(); // current date + time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mapped = userBookings.map((b) => {
      const sessionDate = new Date(b.session.date);
      const sessionTime = b.session.startTime; // format example: "14:30"

      // combine date + time for exact comparison
      const [hours, minutes] = sessionTime.split(":").map(Number);
      sessionDate.setHours(hours, minutes, 0, 0);

      const groupedSeats = b.seats.reduce((acc, seat) => {
        if (!acc[seat.section]) acc[seat.section] = [];
        acc[seat.section].push(seat.seatId);
        return acc;
      }, {});

      let status = "upcoming";

      // Check full timestamp
      if (sessionDate < now) {
        status = "past";
      }

      return {
        id: b._id,
        title: b.event.title,
        date: b.session.date,
        venue: b.event.location.label,
        startTime: b.session.startTime,
        seats: Object.entries(groupedSeats).map(([section, ids]) => ({
          section,
          seatIds: ids,
        })),
        code: b._id.slice(-6).toUpperCase(),
        image: b.event.thumbnailImage,
        status,
        totalAmount: b.totalAmount,
      };
    });

    setTickets(mapped);
  }, [userBookings]);

  return (
    <div
      className="min-h-screen px-4 md:px-10 lg:px-20 py-12 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top right, #e6e0ff 0%, #ffffff 45%, #ffffff 100%)",
      }}
    >
      {/* Floating Blobs (more subtle + matches Interests design) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-100px] left-[-80px] w-[300px] h-[300px] bg-gradient-to-br from-[#6a11cb] to-[#b92b27] rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-120px] right-[-90px] w-[280px] h-[280px] bg-gradient-to-br from-[#2575fc] to-[#6a11cb] rounded-full blur-3xl"></div>
      </div>

      {/* HEADER */}
      <div className="relative z-10 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          Your <span className="text-[#6a11cb]">Tickets</span>
        </h1>
        <p className="text-gray-600 mt-3 text-sm md:text-base max-w-md mx-auto">
          A curated list of every event you’ve booked — upcoming and your past
          experiences.
        </p>
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 max-w-5xl mx-auto bg-white/70 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-xl p-8 md:p-12">
        {/* EMPTY STATE */}
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <img
              src="https://cdn-icons-png.flaticon.com/512/9513/9513815.png"
              className="w-28 h-28 opacity-90 mb-6 drop-shadow-md"
            />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              No Tickets Found
            </h2>
            <p className="text-gray-500 text-sm max-w-sm text-center mb-6">
              Book your first event and it will appear beautifully organized
              here.
            </p>

            <button
              onClick={() => navigate("/interests")}
              className="px-7 py-3 rounded-full bg-gradient-to-r from-[#6a11cb] to-[#b92b27] text-white font-medium shadow-lg hover:opacity-90 transition-all cursor-pointer"
            >
              Explore Interests
            </button>
          </div>
        ) : (
          <>
            {/* UPCOMING SECTION */}
            {tickets.filter((t) => t.status === "upcoming").length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-[#6a11cb] rounded-full mr-2"></div>
                  <h2 className="text-xl font-bold text-[#6a11cb] tracking-wide">
                    Upcoming Events
                  </h2>
                </div>

                <div className="space-y-6">
                  {tickets
                    .filter((t) => t.status === "upcoming")
                    .map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onOpen={setSelectedTicket}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* DIVIDER */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-10"></div>

            {/* PAST SECTION */}
            {tickets.filter((t) => t.status === "past").length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gray-400 rounded-full mr-2"></div>
                  <h2 className="text-xl font-bold text-gray-500 tracking-wide">
                    Past Events
                  </h2>
                </div>

                <div className="space-y-6">
                  {tickets
                    .filter((t) => t.status === "past")
                    .map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onOpen={setSelectedTicket}
                      />
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
