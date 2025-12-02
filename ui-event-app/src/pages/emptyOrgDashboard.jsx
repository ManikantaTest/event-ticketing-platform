export const EmptyOrganizerDashboard = ({ onCreate, name }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <img
        src="https://cdn-icons-png.flaticon.com/512/4076/4076508.png"
        alt="no events"
        className="w-40 h-40 mb-6 opacity-90"
      />

      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome, {name}! 🎉
      </h2>

      <p className="text-gray-500 max-w-md mb-6">
        You haven’t created any events yet. Start by creating your first event
        and your dashboard insights will appear here.
      </p>

      <button
        onClick={onCreate}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition"
      >
        Create Your First Event
      </button>
    </div>
  );
};
