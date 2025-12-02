import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "../components/ToastProvider";

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [method, setMethod] = useState("upi");
  const [processingState, setProcessingState] = useState(null);

  const amount = state?.amount || 0;

  const startPayment = async () => {
    setProcessingState("initializing");
    await wait(1000);

    setProcessingState("processing");
    await wait(1500);

    setProcessingState("verifying");
    await wait(1200);

    try {
      await handleBookingAPI(
        state.eventId,
        state.sessionId,
        state.selectedSeats
      );

      setProcessingState("success");
      toast.success("Payment Successful!");

      setTimeout(() => {
        navigate("/my-bookings");
      }, 1000);
    } catch (err) {
      toast.error("Payment failed. Try again.");
      setProcessingState(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        {/* Header */}
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Razorpay Checkout
        </h2>

        {/* Amount Card */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <p className="text-sm font-medium text-gray-600">Amount to Pay</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">₹{amount}</p>
        </div>

        {/* Payment method tabs */}
        <div className="flex border-b mb-4">
          <Tab
            label="UPI"
            active={method === "upi"}
            onClick={() => setMethod("upi")}
          />
          <Tab
            label="Card"
            active={method === "card"}
            onClick={() => setMethod("card")}
          />
          <Tab
            label="Wallets"
            active={method === "wallet"}
            onClick={() => setMethod("wallet")}
          />
        </div>

        {/* Method Content */}
        {method === "upi" && <UpiSection />}
        {method === "card" && <CardSection />}
        {method === "wallet" && <WalletSection />}

        {/* Pay Button */}
        <button
          onClick={startPayment}
          disabled={processingState !== null}
          className="w-full bg-blue-600 text-white font-semibold text-lg py-3 rounded-lg mt-6 hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          Pay ₹{amount}
        </button>
      </div>

      {/* Processing Overlay */}
      {processingState && <PaymentOverlay state={processingState} />}
    </div>
  );
}

/* ===================== COMPONENTS ===================== */

const Tab = ({ label, active, onClick }) => (
  <button
    className={`flex-1 py-2 text-center font-medium border-b-2 transition ${
      active
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-gray-500"
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

/* --------------- UPI Section --------------- */
const UpiSection = () => (
  <div>
    <label className="text-sm text-gray-600">Enter UPI ID</label>
    <input
      type="text"
      placeholder="example@upi"
      className="w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
    />
  </div>
);

/* --------------- Card Section --------------- */
const CardSection = () => (
  <div>
    <label className="text-sm text-gray-600">Card Number</label>
    <input
      type="text"
      placeholder="1234 5678 9012 3456"
      className="w-full border px-3 py-2 rounded-lg mt-1 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
    />

    <div className="flex gap-3">
      <div className="flex-1">
        <label className="text-sm text-gray-600">Expiry</label>
        <input
          type="text"
          placeholder="MM/YY"
          className="w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div className="flex-1">
        <label className="text-sm text-gray-600">CVV</label>
        <input
          type="password"
          placeholder="***"
          className="w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
    </div>
  </div>
);

/* --------------- Wallet Section --------------- */
const WalletSection = () => (
  <div className="grid grid-cols-2 gap-3">
    {["Paytm", "PhonePe", "Freecharge", "Mobikwik"].map((wallet) => (
      <div
        key={wallet}
        className="border p-3 rounded-lg text-center font-medium cursor-pointer hover:bg-gray-100"
      >
        {wallet}
      </div>
    ))}
  </div>
);

/* --------------- Overlay --------------- */
const PaymentOverlay = ({ state }) => (
  <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-lg font-medium z-50">
    <div className="loader mb-4"></div>
    {state === "initializing" && "Initializing Payment Gateway..."}
    {state === "processing" && "Processing Payment..."}
    {state === "verifying" && "Verifying Transaction..."}
    {state === "success" && "Payment Successful!"}
  </div>
);

/* --------------- Loader Animation --------------- */
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

/* --------------- Booking API (replace with your real API) --------------- */
async function handleBookingAPI(eventId, sessionId, seats) {
  return await fetch("/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, sessionId, seats }),
  }).then((res) => res.json());
}
