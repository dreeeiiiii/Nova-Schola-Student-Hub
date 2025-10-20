"use client";
import React, { useState } from "react";
import { RefreshCcw } from "lucide-react";

interface AdminRefreshButtonProps {
  onRefresh: () => void;
}

const AdminRefreshButton: React.FC<AdminRefreshButtonProps> = ({ onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleClick = async () => {
    setIsRefreshing(true);
    setShowToast(false);

    // Simulate refresh delay
    await new Promise((r) => setTimeout(r, 1000));
    onRefresh();
    setIsRefreshing(false);
    setShowToast(true);

    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-all shadow-md ${
          isRefreshing ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        <RefreshCcw
          size={18}
          className={`${isRefreshing ? "animate-spin text-blue-600" : ""}`}
        />
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </button>

      {/* Toast message */}
      {showToast && (
        <div className="absolute top-12 right-0 bg-white border border-blue-200 shadow-lg rounded-lg px-4 py-2 text-sm text-blue-700 font-medium animate-fade-in">
          ✅ Announcements refreshed!
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminRefreshButton;
