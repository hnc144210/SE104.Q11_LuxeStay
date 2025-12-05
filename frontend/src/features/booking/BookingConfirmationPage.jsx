import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, CreditCard, Lock, ShieldCheck, Star } from "lucide-react";

const BookingConfirmationPage = () => {
  const navigate = useNavigate();

  const bookingData = {
    roomTitle: "Nha Trang Luxury Resort & Spa",
    image:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop",
    rating: 4.8,
    reviews: 120,
    pricePerNight: 120,
    checkIn: "Dec 12, 2025",
    checkOut: "Dec 17, 2025",
    nights: 5,
    guests: 2,
    cleaningFee: 50,
    serviceFee: 80,
  };

  const totalPrice =
    bookingData.pricePerNight * bookingData.nights +
    bookingData.cleaningFee +
    bookingData.serviceFee;

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    paymentMethod: "card", // 'card' | 'paypal'
  });

  const handleConfirm = (e) => {
    e.preventDefault();
    // Logic gọi API đặt phòng sẽ ở đây
    alert("Booking Confirmed! Thank you for choosing LuxeStay.");
    navigate("/"); // Quay về trang chủ
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-20 pt-28 pb-20">
        {/* Header Navigation */}
        <div className="mb-8 flex items-center gap-2 text-[#181E4B]">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-3xl font-serif font-bold">Request to book</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* --- LEFT COLUMN: GUEST INFO & PAYMENT --- */}
          <div className="lg:col-span-2 space-y-10">
            {/* 1. Your Trip Summary (Editable) */}
            <section className="border-b border-gray-200 pb-8">
              <h2 className="text-xl font-bold text-[#181E4B] mb-4">
                Your trip
              </h2>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-gray-800">Dates</h3>
                  <p className="text-gray-600">
                    {bookingData.checkIn} – {bookingData.checkOut}
                  </p>
                </div>
                <button className="font-bold underline text-gray-800 hover:text-[#DF6951]">
                  Edit
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800">Guests</h3>
                  <p className="text-gray-600">{bookingData.guests} guests</p>
                </div>
                <button className="font-bold underline text-gray-800 hover:text-[#DF6951]">
                  Edit
                </button>
              </div>
            </section>

            {/* 2. Contact Information Form */}
            <form
              id="booking-form"
              onSubmit={handleConfirm}
              className="border-b border-gray-200 pb-8"
            >
              <h2 className="text-xl font-bold text-[#181E4B] mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#DF6951]"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#DF6951]"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#DF6951]"
                  placeholder="john@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll email you the booking confirmation.
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#DF6951]"
                  placeholder="+84 90 123 4567"
                />
              </div>
            </form>

            {/* 3. Payment Method */}
            <section className="border-b border-gray-200 pb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#181E4B]">Pay with</h2>
                <div className="flex gap-2">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                    className="h-6"
                    alt="Visa"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                    className="h-6"
                    alt="Mastercard"
                  />
                </div>
              </div>

              {/* Payment Tabs */}
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, paymentMethod: "card" })
                  }
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition ${
                    formData.paymentMethod === "card"
                      ? "border-[#DF6951] bg-orange-50 text-[#DF6951] font-bold"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard size={20} /> Credit Card
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, paymentMethod: "paypal" })
                  }
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition ${
                    formData.paymentMethod === "paypal"
                      ? "border-blue-500 bg-blue-50 text-blue-600 font-bold"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="italic font-serif">PayPal</span>
                </button>
              </div>

              {/* Credit Card Form (Conditional) */}
              {formData.paymentMethod === "card" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="relative">
                    <CreditCard
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#DF6951]"
                      placeholder="Card number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#DF6951]"
                      placeholder="Expiration (MM/YY)"
                    />
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#DF6951]"
                      placeholder="CVV"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* 4. Cancellation Policy */}
            <section className="pb-8">
              <h2 className="text-xl font-bold text-[#181E4B] mb-2">
                Cancellation policy
              </h2>
              <p className="text-gray-600 mb-2">
                <span className="font-bold">
                  Free cancellation before Dec 10.
                </span>{" "}
                Cancel before check-in on Dec 12 for a partial refund.
              </p>
              <a
                href="#"
                className="underline font-bold text-gray-800 hover:text-[#DF6951]"
              >
                Show more
              </a>
            </section>

            <button
              type="submit"
              form="booking-form"
              className="w-full md:w-auto bg-[#DF6951] text-white font-bold text-lg py-4 px-10 rounded-xl hover:bg-orange-600 transition shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Lock size={20} /> Confirm and Pay
            </button>
          </div>

          {/* --- RIGHT COLUMN: ORDER SUMMARY (STICKY) --- */}
          <div className="relative lg:col-span-1">
            <div className="sticky top-28 border border-gray-200 rounded-2xl p-6 shadow-xl bg-white">
              {/* Room Snippet */}
              <div className="flex gap-4 mb-6 border-b border-gray-100 pb-6">
                <img
                  src={bookingData.image}
                  alt="Room"
                  className="w-24 h-24 object-cover rounded-xl"
                />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Entire villa</p>
                  <h3 className="font-bold text-[#181E4B] text-sm leading-tight mb-1">
                    {bookingData.roomTitle}
                  </h3>
                  <div className="flex items-center gap-1 text-xs">
                    <Star
                      className="text-orange-500 fill-orange-500"
                      size={12}
                    />
                    <span className="font-bold">{bookingData.rating}</span>
                    <span className="text-gray-500">
                      ({bookingData.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Protection */}
              <div className="border-b border-gray-100 pb-6 mb-6">
                <h3 className="text-lg font-bold text-[#181E4B] mb-4">
                  Price details
                </h3>
                <div className="space-y-3 text-gray-600 text-sm">
                  <div className="flex justify-between">
                    <span>
                      ${bookingData.pricePerNight} x {bookingData.nights} nights
                    </span>
                    <span>
                      ${bookingData.pricePerNight * bookingData.nights}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleaning fee</span>
                    <span>${bookingData.cleaningFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LuxeStay service fee</span>
                    <span>${bookingData.serviceFee}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center font-bold text-xl text-[#181E4B] mb-6">
                <span>Total (USD)</span>
                <span>${totalPrice}</span>
              </div>

              {/* Trust Badges */}
              <div className="bg-gray-50 p-4 rounded-xl flex gap-3 items-start">
                <ShieldCheck
                  className="text-green-600 shrink-0 mt-1"
                  size={20}
                />
                <div>
                  <p className="font-bold text-sm text-gray-800">
                    Secure Booking
                  </p>
                  <p className="text-xs text-gray-500">
                    Your information is protected by 256-bit SSL encryption.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
