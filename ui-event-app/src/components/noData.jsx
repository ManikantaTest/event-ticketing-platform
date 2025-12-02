// components/NoData.jsx
import noData from "../assets/images/noData1.png"; // Ensure you have an appropriate image in your assets

export default function NoData({ title = "No data found" }) {
  return (
    <div className="flex flex-col items-center justify-center py-1">
      {/* Image */}
      <img src={noData} alt="No data" className="w-48 h-48 mb-1" />

      {/* Title */}
      <p className="text-xs font-medium text-gray-600">{title}</p>
    </div>
  );
}
