import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Search, MapPin } from "lucide-react";

const SearchForm = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    check_in_date: "",
    check_out_date: "",
    max_guests: 1,
  });

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const queryString = new URLSearchParams(searchParams).toString();
    navigate(`/search-results?${queryString}`);
  };

  return (
    // Container chính: Nổi bật, đổ bóng lớn, bo tròn
    <form
      onSubmit={handleSearch}
      className="bg-white p-3 rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col md:flex-row items-center gap-2 md:gap-0 max-w-4xl mx-auto transform translate-y-0 md:translate-y-1/2 z-20 relative"
    >
      {/* 1. Check-in Input */}
      <div className="flex-1 w-full md:w-auto px-6 py-2 relative group md:border-r border-gray-200">
        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 group-focus-within:text-blue-600 transition-colors">
          <Calendar size={14} /> Check-in
        </label>
        <input
          type="date"
          name="check_in_date"
          required
          onChange={handleChange}
          className="w-full bg-transparent text-gray-800 font-semibold text-sm outline-none placeholder-gray-400 font-sans cursor-pointer"
        />
      </div>

      {/* 2. Check-out Input */}
      <div className="flex-1 w-full md:w-auto px-6 py-2 relative group md:border-r border-gray-200">
        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 group-focus-within:text-blue-600 transition-colors">
          <Calendar size={14} /> Check-out
        </label>
        <input
          type="date"
          name="check_out_date"
          required
          onChange={handleChange}
          className="w-full bg-transparent text-gray-800 font-semibold text-sm outline-none placeholder-gray-400 font-sans cursor-pointer"
        />
      </div>

      {/* 3. Guests Input */}
      <div className="flex-1 w-full md:w-auto px-6 py-2 relative group">
        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 group-focus-within:text-blue-600 transition-colors">
          <Users size={14} /> Guests
        </label>
        <input
          type="number"
          name="max_guests"
          min="1"
          defaultValue="1"
          onChange={handleChange}
          placeholder="Add guests"
          className="w-full bg-transparent text-gray-800 font-semibold text-sm outline-none placeholder-gray-400"
        />
      </div>

      {/* 4. Search Button */}
      <button
        type="submit"
        className="w-full md:w-auto bg-[#DF6951] hover:bg-orange-600 text-white font-bold p-4 md:px-8 rounded-[1.5rem] shadow-lg shadow-orange-200 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <Search size={20} />
        <span className="md:hidden">Search</span>{" "}
        {/* Hiện chữ ở mobile, ẩn ở desktop */}
      </button>
    </form>
  );
};

export default SearchForm;
