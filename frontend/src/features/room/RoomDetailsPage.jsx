import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Star,
  Heart,
  Share2,
  Bed,
  Bath,
  Users,
  Wifi,
  Tv,
  Wind,
  Car,
  Coffee,
  Flame,
  PlusCircle,
  Utensils,
  Shirt,
  Sun,
  ShieldCheck,
  CigaretteOff,
} from "lucide-react";

// ------------------------------------------------------------------

// --- 1. CẤU HÌNH ICON MAPPER ---
const AMENITY_ICONS = {
  kitchen: <Utensils size={20} />,
  netflix: <Tv size={20} />,
  ac: <Wind size={20} />,
  wifi: <Wifi size={20} />,
  washer: <Shirt size={20} />,
  balcony: <Sun size={20} />,
  parking: <Car size={20} />,
  pool: <div className="font-bold text-blue-500">POOL</div>,
  coffee: <Coffee size={20} />,
  smoke_alarm: <CigaretteOff size={20} />,
  co_alarm: <ShieldCheck size={20} />,
  first_aid: <PlusCircle size={20} />,
  fire_ext: <Flame size={20} />,
};

const RoomDetailsPage = () => {
  const { id } = useParams();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 2. GIẢ LẬP GỌI API ---
  useEffect(() => {
    const fetchRoomDetails = async () => {
      setLoading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockApiResponse = {
          id: "1",
          title: "Nha Trang Luxury Resort & Spa",
          location: "12 Tran Phu, Nha Trang, Khanh Hoa, Vietnam",
          price: 120,
          rating: 4.8,
          reviews: 120,
          description:
            "Enjoy a breathtaking view of the ocean from this luxurious suite. Designed for comfort and elegance, our resort offers world-class amenities including a private beach, infinity pool, and 5-star dining experiences.",
          images: [
            "https://i.pinimg.com/1200x/c4/5a/1b/c45a1b389964c35302c88fd892b8ecef.jpg",
            "https://i.pinimg.com/1200x/bc/a0/16/bca01660ec597d6a16e7641b3726eac3.jpg",
            "https://i.pinimg.com/1200x/a3/8c/7c/a38c7cfd8b9df68c266532dde441e915.jpg",
            "https://i.pinimg.com/1200x/31/a9/b6/31a9b6d98b741f606e4614b768ea7242.jpg",
            "https://i.pinimg.com/1200x/38/1b/69/381b6906e650b1d9844f02887b61ff75.jpg",
            "https://dkdecor.vn/wp-content/uploads/2025/05/spa-thien-nhien-o-da-lat.jpg",
            "https://dkdecor.vn/wp-content/uploads/2025/05/wmremove-transformed.png",
          ],
          host: {
            name: "LuxeStay",
            avatar:
              "https://ui-avatars.com/api/?name=Luxe+Stay&background=0D8ABC&color=fff",
            superhost: true,
          },
          specs: {
            guests: 6,
            bedrooms: 3,
            beds: 3,
            baths: 3,
          },
          amenities: [
            { code: "kitchen", name: "Kitchen" },
            { code: "netflix", name: "Television with Netflix" },
            { code: "ac", name: "Air Conditioner" },
            { code: "wifi", name: "Free Wireless Internet" },
            { code: "washer", name: "Washer" },
            { code: "balcony", name: "Balcony or Patio" },
          ],
          safety: [
            { code: "smoke_alarm", name: "Smoke alarm" },
            { code: "co_alarm", name: "Carbon monoxide alarm" },
            { code: "first_aid", name: "First aid kit" },
            { code: "fire_ext", name: "Fire extinguisher" },
          ],
        };

        setRoom(mockApiResponse);
      } catch (error) {
        console.error("Failed to fetch room details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id]);

  // --- 3. LOADING STATE ---
  if (loading) {
    return (
      <div className="bg-white min-h-screen font-sans">
        <div className="max-w-7xl mx-auto px-4 md:px-20 pt-28 pb-20 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] mb-10">
            <div className="col-span-2 row-span-2 bg-gray-200 rounded-2xl"></div>
            <div className="bg-gray-200 rounded-2xl"></div>
            <div className="bg-gray-200 rounded-2xl"></div>
            <div className="bg-gray-200 rounded-2xl"></div>
            <div className="bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-3 gap-12">
            <div className="col-span-2 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="col-span-1 h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!room) return <div className="pt-32 text-center">Room not found</div>;

  return (
    <div className="bg-white min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-20 pt-28 pb-20">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-[#181E4B]">
            {room.title}
          </h1>
          <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Star className="text-orange-500 fill-orange-500" size={16} />
              <span className="font-bold text-black">{room.rating}</span>
              <span className="underline cursor-pointer">
                ({room.reviews} reviews)
              </span>
              <span>•</span>
              <span className="underline cursor-pointer">{room.location}</span>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-[#181E4B] hover:bg-gray-100 px-3 py-2 rounded-lg transition">
                <Share2 size={18} /> Share
              </button>
              <button className="flex items-center gap-2 text-[#181E4B] hover:bg-gray-100 px-3 py-2 rounded-lg transition">
                <Heart size={18} /> Save
              </button>
            </div>
          </div>
        </div>

        {/* GALLERY */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-10 relative">
          <div className="col-span-2 row-span-2 cursor-pointer hover:opacity-90 transition">
            <img
              src={room.images[0]}
              alt="Main"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Render 4 ảnh nhỏ */}
          {room.images.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              className="cursor-pointer hover:opacity-90 transition relative"
            >
              <img src={img} className="w-full h-full object-cover" />
              {idx === 3 && room.images.length > 5 && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center hover:bg-black/20 transition">
                  <span className="text-white font-bold text-lg">
                    + View All
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* LEFT COLUMN */}
          <div className="md:col-span-2 space-y-10">
            {/* HOST INFO */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-6">
              <div>
                <h2 className="text-xl font-bold text-[#181E4B]">
                  Entire villa hosted by {room.host.name}
                </h2>
                <p className="text-gray-500">
                  {room.specs.guests} guests • {room.specs.bedrooms} bedrooms •{" "}
                  {room.specs.beds} beds • {room.specs.baths} baths
                </p>
              </div>
              <img
                src={room.host.avatar}
                alt="Host"
                className="w-14 h-14 rounded-full border bg-gray-50 object-contain p-1"
              />
            </div>

            {/* ICONS SPECS */}
            <div className="flex gap-6 border-b border-gray-100 pb-6 overflow-x-auto">
              <div className="flex flex-col items-center gap-2 bg-gray-50 p-4 rounded-xl min-w-[100px]">
                <Bed size={24} className="text-[#181E4B]" />
                <span className="text-xs font-bold text-gray-500">
                  {room.specs.bedrooms} Bedrooms
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 bg-gray-50 p-4 rounded-xl min-w-[100px]">
                <Bath size={24} className="text-[#181E4B]" />
                <span className="text-xs font-bold text-gray-500">
                  {room.specs.baths} Baths
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 bg-gray-50 p-4 rounded-xl min-w-[100px]">
                <Users size={24} className="text-[#181E4B]" />
                <span className="text-xs font-bold text-gray-500">
                  {room.specs.guests} Guests
                </span>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-xl font-bold text-[#181E4B] mb-4">
                About this place
              </h3>
              <p className="text-gray-500 leading-relaxed whitespace-pre-line">
                {room.description}
              </p>
            </div>

            {/* AMENITIES */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-xl font-bold text-[#181E4B] mb-6">
                Offered Amenities
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {room.amenities.map((item) => (
                  <div
                    key={item.code}
                    className="flex items-center gap-3 text-gray-500"
                  >
                    <span className="text-gray-600">
                      {AMENITY_ICONS[item.code] || <Star size={20} />}
                    </span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SAFETY */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-xl font-bold text-[#181E4B] mb-6">
                Safety and Hygiene
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {room.safety.map((item) => (
                  <div
                    key={item.code}
                    className="flex items-center gap-3 text-gray-500"
                  >
                    <span className="text-gray-600">
                      {AMENITY_ICONS[item.code] || <ShieldCheck size={20} />}
                    </span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* REVIEWS */}
            <div>
              <h3 className="text-xl font-bold text-[#181E4B] mb-6 flex items-center gap-2">
                <Star className="text-orange-500 fill-orange-500" size={24} />{" "}
                {room.rating} • {room.reviews} reviews
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                    <div>
                      <h4 className="font-bold text-[#181E4B]">
                        John Doberman
                      </h4>
                      <p className="text-xs text-gray-500">Nov 2024</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm italic">
                    "Absolutely loved my stay! Everything was perfect."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: BOOKING CARD */}
          <div className="relative">
            <div className="sticky top-28 bg-white border border-gray-200 shadow-xl rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-2xl font-bold text-[#181E4B]">
                    ${room.price}
                  </span>
                  <span className="text-gray-500"> / night</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="text-orange-500 fill-orange-500" size={14} />
                  <span className="font-bold">{room.rating}</span>
                  <span className="text-gray-500 underline">
                    ({room.reviews})
                  </span>
                </div>
              </div>

              <div className="border border-gray-400 rounded-lg overflow-hidden mb-4">
                <div className="grid grid-cols-2 border-b border-gray-400">
                  <div className="p-3 border-r border-gray-400 cursor-pointer hover:bg-gray-50">
                    <label className="block text-[10px] font-bold uppercase text-[#181E4B]">
                      Check-in
                    </label>
                    <span className="text-sm text-gray-500">Add date</span>
                  </div>
                  <div className="p-3 cursor-pointer hover:bg-gray-50">
                    <label className="block text-[10px] font-bold uppercase text-[#181E4B]">
                      Check-out
                    </label>
                    <span className="text-sm text-gray-500">Add date</span>
                  </div>
                </div>
                <div className="p-3 cursor-pointer hover:bg-gray-50">
                  <label className="block text-[10px] font-bold uppercase text-[#181E4B]">
                    Guests
                  </label>
                  <span className="text-sm text-gray-500">
                    {room.specs.guests} guests max
                  </span>
                </div>
              </div>

              <button className="w-full bg-[#DF6951] text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition mb-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Reserve Now
              </button>

              <p className="text-center text-xs text-gray-500 mb-6">
                You won't be charged yet
              </p>

              <div className="space-y-3 text-gray-500 text-sm">
                <div className="flex justify-between">
                  <span className="underline">${room.price} x 5 nights</span>
                  <span>${room.price * 5}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">Cleaning fee</span>
                  <span>$50</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">Service fee</span>
                  <span>$80</span>
                </div>
              </div>

              <hr className="my-4 border-gray-200" />

              <div className="flex justify-between font-bold text-lg text-[#181E4B]">
                <span>Total</span>
                <span>${room.price * 5 + 50 + 80}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPage;
