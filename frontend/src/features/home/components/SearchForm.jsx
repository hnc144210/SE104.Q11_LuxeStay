import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    // Tạo Query String để truyền lên URL
    const queryString = new URLSearchParams(searchParams).toString();
    // Chuyển hướng sang trang kết quả kèm params
    navigate(`/search-results?${queryString}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white p-6 rounded-xl shadow-lg flex flex-wrap gap-4 items-end"
    >
      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Check-in
        </label>
        <input
          type="date"
          name="check_in_date"
          required
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
      </div>
      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Check-out
        </label>
        <input
          type="date"
          name="check_out_date"
          required
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
      </div>
      <div className="w-[100px]">
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Guests
        </label>
        <input
          type="number"
          name="max_guests"
          min="1"
          defaultValue="1"
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition h-[42px]"
      >
        Search
      </button>
    </form>
  );
};

export default SearchForm;
