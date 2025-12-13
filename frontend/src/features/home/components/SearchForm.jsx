import React, { useState } from "react";
import { Calendar, Users, Search, Minus, Plus } from "lucide-react";

const SearchForm = () => {
  const [searchParams, setSearchParams] = useState({
    check_in_date: "",
    check_out_date: "",
    max_guests: 1,
  });

  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleGuestChange = (operation) => {
    setSearchParams((prev) => {
      const currentVal = parseInt(prev.max_guests) || 1;
      let newVal = currentVal;

      if (operation === "inc") newVal = currentVal + 1;
      if (operation === "dec") newVal = Math.max(1, currentVal - 1);

      return { ...prev, max_guests: newVal };
    });
  };

  const handleSearch = () => {
    if (!searchParams.check_in_date || !searchParams.check_out_date) {
      alert("Vui lòng chọn ngày nhận và trả phòng!");
      return;
    }
    const queryString = new URLSearchParams(searchParams).toString();
    console.log("Navigate to:", `/search-results?${queryString}`);
    alert("Tìm kiếm với:\n" + JSON.stringify(searchParams, null, 2));
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "Chọn ngày";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="relative">
        <div
          className={`
            flex flex-col md:flex-row items-stretch bg-white rounded-3xl 
            shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_35px_rgba(0,0,0,0.16)] 
            transition-all duration-300 border border-gray-100 overflow-hidden
          `}
        >
          {/* NGÀY NHẬN PHÒNG */}
          <div
            className={`
              relative flex-1 px-7 py-5 cursor-pointer transition-all duration-200
              border-b md:border-b-0 md:border-r border-gray-100
              ${
                focusedField === "checkin"
                  ? "bg-blue-50/50"
                  : "hover:bg-gray-50"
              }
            `}
            onClick={() =>
              document.getElementById("check_in_input")?.showPicker()
            }
            onMouseEnter={() => setFocusedField("checkin")}
            onMouseLeave={() => setFocusedField(null)}
          >
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                <Calendar size={14} className="text-blue-600" />
                Nhận phòng
              </label>
              <input
                id="check_in_input"
                type="date"
                name="check_in_date"
                value={searchParams.check_in_date}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span
                className={`text-base font-semibold ${
                  searchParams.check_in_date ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {formatDateDisplay(searchParams.check_in_date)}
              </span>
            </div>
          </div>

          {/* NGÀY TRẢ PHÒNG */}
          <div
            className={`
              relative flex-1 px-7 py-5 cursor-pointer transition-all duration-200
              border-b md:border-b-0 md:border-r border-gray-100
              ${
                focusedField === "checkout"
                  ? "bg-blue-50/50"
                  : "hover:bg-gray-50"
              }
            `}
            onClick={() =>
              document.getElementById("check_out_input")?.showPicker()
            }
            onMouseEnter={() => setFocusedField("checkout")}
            onMouseLeave={() => setFocusedField(null)}
          >
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                <Calendar size={14} className="text-blue-600" />
                Trả phòng
              </label>
              <input
                id="check_out_input"
                type="date"
                name="check_out_date"
                value={searchParams.check_out_date}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span
                className={`text-base font-semibold ${
                  searchParams.check_out_date
                    ? "text-gray-900"
                    : "text-gray-400"
                }`}
              >
                {formatDateDisplay(searchParams.check_out_date)}
              </span>
            </div>
          </div>

          {/* SỐ KHÁCH */}
          <div
            className={`
              relative flex-1 px-7 py-5 transition-all duration-200
              ${
                focusedField === "guests" ? "bg-blue-50/50" : "hover:bg-gray-50"
              }
            `}
            onMouseEnter={() => setFocusedField("guests")}
            onMouseLeave={() => setFocusedField(null)}
          >
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                <Users size={14} className="text-blue-600" />
                Số khách
              </label>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGuestChange("dec");
                  }}
                  disabled={searchParams.max_guests <= 1}
                  className={`
                    w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all
                    ${
                      searchParams.max_guests <= 1
                        ? "border-gray-200 text-gray-300 cursor-not-allowed"
                        : "border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600"
                    }
                  `}
                >
                  <Minus size={16} strokeWidth={2.5} />
                </button>

                <div className="flex items-center gap-2 min-w-[70px] justify-center">
                  <span className="text-base font-semibold text-gray-900">
                    {searchParams.max_guests}
                  </span>
                  <span className="text-sm text-gray-500">khách</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGuestChange("inc");
                  }}
                  className="w-9 h-9 rounded-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 flex items-center justify-center transition-all"
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

          {/* NÚT TÌM KIẾM */}
          <div className="flex items-center justify-center p-3">
            <button
              onClick={handleSearch}
              className="
                w-full md:w-auto 
                bg-gradient-to-r from-blue-600 to-blue-700 
                hover:from-blue-700 hover:to-blue-800
                text-white font-bold 
                h-14 md:h-16 px-8 md:px-10
                rounded-2xl md:rounded-full
                shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300
                transition-all duration-300 transform hover:scale-105 active:scale-95
                flex items-center justify-center gap-3
              "
            >
              <Search size={22} strokeWidth={2.5} />
              <span className="text-base md:text-lg font-semibold">
                Tìm kiếm
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
