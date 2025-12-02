import { useEffect } from "react";

import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Twitter,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EventCard from "../components/eventCard";
import { fetchOrganizerEvents } from "../redux/slices/organizerProfileSlice";

function OrganizerProfile() {
  const dispatch = useDispatch();

  const { organizer, organizerEvents, organizerEventsLoading } = useSelector(
    (state) => state.organizerProfile
  );

  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState("");
  const [filters, setFilters] = useState({
    date: null,
    rating: null,
  });

  const totalPages = organizerEvents?.totalPages || 5;
  const id = organizer?._id;

  const sortOptions = [
    { label: "Sort by Date ↑", field: "date", value: 1 },
    { label: "Sort by Date ↓", field: "date", value: -1 },
    { label: "Sort by Rating ↑", field: "rating", value: 1 },
    { label: "Sort by Rating ↓", field: "rating", value: -1 },
  ];

  useEffect(() => {
    if (!id) return;
    const query = buildQuery();
    dispatch(fetchOrganizerEvents({ organizerId: id, query })).unwrap();
  }, [id, dispatch, filters, page]);

  const buildQuery = () => {
    const query = {
      page,
      limit: 8,
    };
    if (filters.date) query.date = filters.date;
    if (filters.rating) query.rating = filters.rating;

    return query;
  };

  const handleSortChange = (e) => {
    if (e.target.value === "clear") {
      setSortOption("");
      setFilters({ date: null, rating: null });
      return;
    }

    const selected = sortOptions.find((opt) => opt.label === e.target.value);

    setSortOption(selected.label);

    if (selected.field === "date") {
      setFilters((prev) => ({
        ...prev,
        date: selected.value,
        rating: null, // reset rating sort
      }));
    } else if (selected.field === "rating") {
      setFilters((prev) => ({
        ...prev,
        rating: selected.value,
        date: null, // reset date sort
      }));
    }
    setPage(1);
  };

  const handlePrevPage = () => setPage((prev) => prev - 1);
  const handleNextPage = () => setPage((prev) => prev + 1);

  return (
    <div
      className="font-sans min-h-screen p-4 md:p-6 lg:p-8"
      style={{
        background:
          "linear-gradient(to bottom, #e8edff 0%, #f4f6ff 25%, #ffffff 100%)",
      }}
    >
      {/* Banner with Profile Image Overlay */}
      <div className="relative h-[420px] max-w-7xl mx-auto overflow-hidden rounded-xl shadow-lg">
        <img
          src={organizer?.organizerBannerImage}
          alt="Organizer Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Info Overlay */}
        <div className="absolute bottom-6 left-6 text-white space-y-3">
          {/* Organizer Name */}
          <h1 className="text-3xl md:text-4xl font-extrabold">
            {organizer?.orgName || "Organizer Name"}
          </h1>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`material-symbols-outlined ${
                    star <= organizer?.averageRating
                      ? "text-amber-400"
                      : "text-gray-300"
                  }`}
                >
                  star
                </span>
              ))}
            </div>
            <span className="font-bold">
              {organizer?.averageRating || "4.8"}
            </span>
            <span className="text-sm text-gray-200">
              {"(" + organizer?.totalReviews + " reviews)" || 124}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Us */}
          <section className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-3 text-gray-800">About Us</h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              {organizer?.orgDescription || "No description available."}
            </p>
            <h2 className="text-2xl font-bold mt-3 mb-5 text-gray-800">
              Specialities
            </h2>
            <div className="flex flex-wrap gap-2">
              {organizer?.orgSpecialities?.map((cat) => (
                <span
                  key={cat}
                  className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div>
          <section className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-gray-500" />
                <span>{organizer?.orgEmail || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-gray-500" />
                <span>{organizer?.phone || "N/A"}</span>
              </div>
            </div>

            <div className="my-4 border-t border-gray-200"></div>

            {/* Social Media */}
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              Social Media
            </h3>
            <div className="flex space-x-2">
              <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <Facebook className="w-4 h-4 text-blue-600" />
              </button>
              <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <Instagram className="w-4 h-4 text-pink-500" />
              </button>
              <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <Linkedin className="w-4 h-4 text-blue-700" />
              </button>
              <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <Twitter className="w-4 h-4 text-sky-500" />
              </button>
            </div>
          </section>
        </div>
      </div>

      <div className="w-full mt-15">
        <div className="max-w-7xl mx-auto">
          {/* Sort dropdown aligned right */}
          <div className="flex items-center justify-between mb-6 mr-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Events Hosted
            </h2>

            {/* Sort dropdown */}
            <div className="relative inline-block">
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="appearance-none rounded-lg px-4 py-2 pr-10 text-sm font-semibold border border-gray-300 shadow-sm 
             focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-100 cursor-pointer
             bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent"
              >
                <option value="" disabled className="text-gray-400">
                  Select Sort
                </option>
                {sortOptions.map((opt) => (
                  <option
                    key={opt.label}
                    value={opt.label}
                    className="text-gray-800"
                  >
                    {opt.label}
                  </option>
                ))}
                <option value="clear" className="text-gray-800">
                  Clear Sort
                </option>
              </select>

              {/* Custom arrow */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </div>
          </div>

          {organizerEventsLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-pink-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {organizerEvents?.data?.map((event) => (
                <EventCard key={event._id} item={event} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-12">
            <nav>
              <ul className="inline-flex gap-1 text-sm">
                {/* Prev */}
                <li>
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="
              px-4 h-10 flex items-center justify-center rounded-lg
              bg-white border border-gray-300 text-gray-600
              hover:bg-gray-100 disabled:opacity-50
            "
                  >
                    Previous
                  </button>
                </li>

                {/* Page Numbers */}
                {(() => {
                  const maxVisible = 7;
                  let start = Math.max(1, page - Math.floor(maxVisible / 2));
                  let end = start + maxVisible - 1;

                  if (end > totalPages) {
                    end = totalPages;
                    start = Math.max(1, end - maxVisible + 1);
                  }

                  return Array.from(
                    { length: end - start + 1 },
                    (_, i) => start + i
                  ).map((num) => (
                    <li key={num}>
                      <button
                        onClick={() => setPage(num)}
                        aria-current={num === page ? "page" : undefined}
                        className={`
                  px-4 h-10 flex items-center justify-center rounded-lg border
                  transition
                  ${
                    num === page
                      ? "bg-pink-50 text-pink-600 border-pink-300"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                  }
                `}
                      >
                        {num}
                      </button>
                    </li>
                  ));
                })()}

                {/* Next */}
                <li>
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="
              px-4 h-10 flex items-center justify-center rounded-lg
              bg-white border border-gray-300 text-gray-600
              hover:bg-gray-100 disabled:opacity-50
            "
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerProfile;
