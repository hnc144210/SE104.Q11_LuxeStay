import React from "react";

const steps = [
  {
    title: "Search & Select",
    desc: "Find the perfect room based on your preferences and budget.",
    icon: "🔍",
  },
  {
    title: "Secure Payment",
    desc: "Complete your booking with our safe and multiple payment options.",
    icon: "💳",
  },
  {
    title: "Enjoy Your Stay",
    desc: "Receive instant confirmation and get ready for your luxury experience.",
    icon: "🏨",
  },
];

const BookingStepsSection = () => {
  return (
    <section className="py-20 px-4 md:px-20 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      {/* Left Steps */}
      <div>
        <h3 className="text-text-light font-medium uppercase">
          Simple Process
        </h3>
        <h2 className="text-4xl font-serif font-bold text-text-dark mb-8">
          Book Your Next Stay
          <br />
          In 3 Easy Steps
        </h2>

        <div className="space-y-8">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-6 items-center">
              <div className="w-14 h-14 rounded-xl flex flex-shrink-0 items-center justify-center text-2xl bg-white shadow-md text-primary">
                {step.icon}
              </div>
              <div>
                <h4 className="font-bold text-text-dark text-lg">
                  {step.title}
                </h4>
                <p className="text-text-light text-sm max-w-xs leading-relaxed mt-1">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Card (Booking Confirmation Mockup) */}
      <div className="relative flex justify-center py-10">
        {/* Background Blur Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10"></div>

        <div className="bg-white p-5 rounded-[26px] shadow-2xl max-w-sm w-full relative z-10 border border-gray-100">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80" // Ảnh khách sạn sang chảnh
            className="w-full h-48 object-cover rounded-2xl mb-5 shadow-sm"
            alt="Hotel"
          />
          <h4 className="font-bold text-text-dark text-xl mb-1">
            Santorini Luxury Resort
          </h4>
          <p className="text-text-light text-sm mb-4">Check-in: 14 June 2025</p>

          <div className="flex gap-4 mb-6 border-b border-gray-100 pb-4">
            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600 font-medium">
              🏊 Pool
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600 font-medium">
              📶 Wifi
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600 font-medium">
              🍳 Breakfast
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-primary text-white text-xs flex items-center justify-center border-2 border-white font-bold">
                +2
              </div>
            </div>
            <span className="text-primary font-bold text-lg">$420</span>
          </div>
        </div>

        {/* Decorative Floating Card - "Reservation Confirmed" */}
        <div className="absolute top-[65%] -right-4 md:-right-12 bg-white p-4 rounded-xl shadow-xl z-20 flex gap-4 items-center animate-bounce  md:flex border border-gray-50">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
            ✓
          </div>
          <div>
            <span className="text-xs text-text-light block">Status</span>
            <h5 className="font-bold text-text-dark text-sm">
              Booking Confirmed
            </h5>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingStepsSection;
