import {
  BarChart3,
  Calendar,
  CircleDollarSign,
  CreditCard,
  Eye,
  Headphones,
  Lightbulb,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getOrganizerBasicStats,
  getOrganizerCategoryStats,
  getOrganizerEvents,
  getOrganizerSalesStats,
  getOrganizerTopSellingEvents,
  getOrganizerUpcomingEvents,
} from "../redux/slices/organizerProfileSlice";
import { EmptyOrganizerDashboard } from "./emptyOrgDashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { dashboardStats, events, totalPages, loading } = useSelector(
    (state) => state.organizerProfile
  );

  const [limit] = useState(5);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const handlePrevPage = () => setPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setPage((p) => Math.min(p + 1, totalPages));

  const sortedCategories = dashboardStats?.categoryPercentages
    ? [...dashboardStats.categoryPercentages].sort((a, b) =>
        a.category.localeCompare(b.category)
      )
    : [];

  const sortedRevenue = dashboardStats?.revenueByCategory
    ? [...dashboardStats.revenueByCategory].sort((a, b) =>
        a._id.localeCompare(b._id)
      )
    : [];

  useEffect(() => {
    async function loadDashboard() {
      await Promise.all([
        dispatch(getOrganizerBasicStats()),
        dispatch(getOrganizerSalesStats()),
        dispatch(getOrganizerCategoryStats()),
        dispatch(getOrganizerTopSellingEvents()),
        dispatch(getOrganizerUpcomingEvents()),
      ]);
    }
    loadDashboard();
  }, []);

  useEffect(() => {
    const params = {
      page,
      limit,
      ...(search ? { search } : {}), // ✅ only add if search has a value
    };
    dispatch(getOrganizerEvents(params)).unwrap();
  }, [page, search]);

  function formatPrettyDate(dateString) {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    // Suffix: 1st, 2nd, 3rd, 4th...
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";

    return `${day}${suffix} ${month} ${year}`;
  }

  const handleClick = (id) => {
    navigate(`/manage/event/${id}`);
  };

  if (dashboardStats && dashboardStats.totalEvents === 0) {
    return (
      <EmptyOrganizerDashboard
        onCreate={() => navigate("/create-event")}
        name={dashboardStats.organizer}
      />
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Event Organizer Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {dashboardStats?.organizer}
          </p>
        </div>

        {/* Performance Overview */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Performance Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {dashboardStats &&
              [
                {
                  title: "Total Events",
                  value: dashboardStats?.totalEvents,
                  change: "All events created so far",
                  color: "text-blue-700",
                  bgcolor: "bg-blue-50",
                  icon: <BarChart3 />,
                },
                {
                  title: "Total Revenue",
                  value: `₹${dashboardStats?.totalRevenue?.toLocaleString()}`,
                  change: "Cumulative revenue generated",
                  color: "text-green-700",
                  bgcolor: "bg-green-50",
                  icon: <CircleDollarSign />,
                },
                {
                  title: "Total Tickets Sold",
                  value: dashboardStats?.totalTicketsSold,
                  change: "Tickets sold across all events",
                  color: "text-purple-700",
                  bgcolor: "bg-purple-50",
                  icon: <TrendingUp />,
                },
                {
                  title: "Active Events",
                  value: dashboardStats?.activeEvents,
                  change: "Currently live or upcoming events",
                  color: "text-yellow-700",
                  bgcolor: "bg-yellow-50",
                  icon: <TrendingDown />,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`${stat.bgcolor} rounded-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow w-full`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className={`${stat.color} font-semibold text-sm`}>
                      {stat.title}
                    </p>
                    <span className={`${stat.color}`}>{stat.icon}</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <p className={`${stat.color} text-sm mt-2`}>{stat.change}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-xl p-6 w-full">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Event Categories
            </h3>
            {sortedCategories.some((c) => Number(c.percentage) > 0) ? (
              <Chart
                type="donut"
                height={250}
                series={sortedCategories.map((c) => Number(c.percentage))}
                options={{
                  labels: sortedCategories.map((c) => c.category),
                  dataLabels: { enabled: false },
                  colors: [
                    "#4F46E5",
                    "#818CF8",
                    "#C7D2FE",
                    "#E5E7EB",
                    "#6B7280",
                  ],
                  legend: { position: "bottom" },
                }}
              />
            ) : (
              <div className="text-center py-10 text-gray-400">
                No category data available
              </div>
            )}
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6 w-full">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Event Category Performance
            </h3>
            {sortedRevenue.some((c) => c.revenue > 0) ? (
              <Chart
                type="bar"
                height={300}
                series={[
                  {
                    name: "Revenue",
                    data: sortedRevenue.map((c) => c.revenue),
                  },
                ]}
                options={{
                  chart: { toolbar: { show: false } },
                  colors: ["#6366F1"],
                  plotOptions: { bar: { borderRadius: 6, columnWidth: "45%" } },
                  dataLabels: { enabled: false },
                  xaxis: {
                    categories: sortedRevenue.map((c) => c._id),
                    labels: { style: { colors: "#6B7280", fontSize: "12px" } },
                  },
                  yaxis: {
                    title: { text: "Revenue (₹)" },
                    labels: { style: { colors: "#6B7280" } },
                  },
                  grid: { borderColor: "#e5e7eb" },
                }}
              />
            ) : (
              <div className="text-center py-10 text-gray-400">
                No revenue data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 mb-8 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Your Events</h3>

            <div className="flex gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search events"
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  className="pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none "
                />
              </div>

              {/* Create Event Button */}
              <button
                className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg font-medium hover:bg-indigo-100 transition"
                onClick={() => navigate("/create-event")}
              >
                <Plus className="w-4 h-4" /> Create Event
              </button>
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-3">Loading events...</p>
            </div>
          ) : events?.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No events found.
            </div>
          ) : (
            <>
              {/* Table */}
              <table className="w-full min-w-max border-collapse text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      "Event Name",
                      "Category",
                      "Date",
                      "Status",
                      "Price",
                      "Actions",
                    ].map((head, i) => (
                      <th
                        key={i}
                        className="text-left px-4 py-3 text-sm font-semibold"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {events.map((e, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium">{e.title}</td>
                      <td className="px-4 py-3">{e.category}</td>
                      <td className="px-4 py-3">
                        {/* {new Date(e.startDate).toLocaleDateString()} */}
                        {formatPrettyDate(e.startDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-sm rounded ${
                            e.status === "active"
                              ? "text-green-600 border border-green-600"
                              : "text-gray-500 border border-gray-300"
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">₹{e.startingPrice}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          className="text-gray-600 hover:text-indigo-600 transition"
                          onClick={() => handleClick(e._id)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <nav className="flex justify-center mt-8">
                <ul className="flex items-center gap-2 text-sm">
                  {/* Previous */}
                  <li>
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg border bg-white text-gray-600 
                   hover:bg-gray-100 disabled:opacity-40 disabled:cursor-default"
                    >
                      Prev
                    </button>
                  </li>

                  {/* Page numbers */}
                  {(() => {
                    const buttons = [];
                    const last = totalPages;

                    const pushPage = (p) => {
                      buttons.push(
                        <li key={p}>
                          <button
                            onClick={() => setPage(p)}
                            className={`px-3 py-1.5 rounded-lg border transition 
              ${
                p === page
                  ? "bg-indigo-600 text-white border-indigo-600 shadow"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
                          >
                            {p}
                          </button>
                        </li>
                      );
                    };

                    const pushDots = (key) => {
                      buttons.push(
                        <li key={key}>
                          <span className="px-3 text-gray-400">...</span>
                        </li>
                      );
                    };

                    // Always show 1
                    pushPage(1);

                    // Between start and current
                    if (page > 3) pushDots("dots-start");

                    if (page > 2) pushPage(page - 1);

                    // Current
                    if (page !== 1 && page !== last) pushPage(page);

                    if (page < last - 1) pushPage(page + 1);

                    // Between current and end
                    if (page < last - 2) pushDots("dots-end");

                    // Always show last
                    if (last > 1) pushPage(last);

                    return buttons;
                  })()}

                  {/* Next */}
                  <li>
                    <button
                      onClick={handleNextPage}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg border bg-white text-gray-600 
                   hover:bg-gray-100 disabled:opacity-40 disabled:cursor-default"
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>

        {/* Quick Actions + Side Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upcoming Events */}
          <div className="bg-white shadow-lg rounded-xl p-6 w-full h-[320px] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Upcoming Events
            </h3>
            {dashboardStats?.upcomingEvents?.length ? (
              dashboardStats?.upcomingEvents?.map((ev, i) => (
                <div key={i} className="flex items-center py-2">
                  <Calendar className="text-indigo-600 mr-2" />
                  <div>
                    <p className="font-medium">{ev.title}</p>
                    <p className="text-sm text-gray-500">
                      {/* {new Date(ev.startDate).toLocaleDateString()} */}
                      {formatPrettyDate(ev.startDate)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-6">
                No upcoming events
              </p>
            )}
          </div>

          {/* Top Selling Events */}
          <div className="bg-white shadow-lg rounded-xl p-6 w-full h-[320px] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Top Selling Events
            </h3>
            {dashboardStats?.topSelling?.length ? (
              dashboardStats?.topSelling?.map((ev, i) => (
                <div key={i} className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium">{ev.title}</p>
                    <p className="text-sm text-gray-500">
                      {ev.ticketsSold} tickets sold
                    </p>
                  </div>
                  <p className="text-green-600 font-bold">₹{ev.revenue}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-6">
                No top selling events
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow-lg rounded-xl p-6 w-full h-[320px]">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex items-center justify-center gap-1 bg-blue-50 text-blue-800 rounded-lg py-2 hover:bg-blue-100 transition"
                onClick={() => navigate("/create-event")}
              >
                <Plus className="w-4 h-4" /> Create Event
              </button>
              <button className="flex items-center justify-center gap-1 bg-green-50 text-green-600 rounded-lg py-2 hover:bg-green-100 transition">
                <BarChart3 className="w-4 h-4" /> Analytics
              </button>
              <button className="flex items-center justify-center gap-1 bg-purple-50 text-purple-600 rounded-lg py-2 hover:bg-purple-100 transition">
                <CreditCard className="w-4 h-4" /> Payments
              </button>
              <button className="flex items-center justify-center gap-1 bg-yellow-50 text-orange-600 rounded-lg py-2 hover:bg-yellow-100 transition">
                <Headphones className="w-4 h-4" /> Support
              </button>
            </div>
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="font-bold flex items-center gap-1">
                <Lightbulb className="text-yellow-500 w-4 h-4" /> Pro Tip
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Engage with attendees before your event to increase
                participation. Send reminder emails 24 hours before the event
                starts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
