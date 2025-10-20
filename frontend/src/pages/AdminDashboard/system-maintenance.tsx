"use client";
import React, { useEffect, useState } from "react";
import { RefreshCcw, Server, AlertCircle, Play, CheckCircle } from "lucide-react";

interface SystemStatus {
  uptime: string;
  activeUsers: number;
  serverLoad: number; // percentage
  lastError?: string;
}

interface MaintenanceTask {
  id: number;
  name: string;
  status: "pending" | "running" | "completed";
}

const SystemMaintenancePage: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>({
    uptime: "0d 0h 0m",
    activeUsers: 0,
    serverLoad: 0,
  });

  const [tasks, setTasks] = useState<MaintenanceTask[]>([
    { id: 1, name: "Backup Database", status: "pending" },
    { id: 2, name: "Clear Cache", status: "pending" },
    { id: 3, name: "Restart Server", status: "pending" },
  ]);

  // Simulate real-time updates (replace with WebSocket or SSE)
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus((prev) => ({
        ...prev,
        activeUsers: Math.floor(Math.random() * 1000),
        serverLoad: parseFloat((Math.random() * 100).toFixed(2)),
        uptime: `${Math.floor(Math.random() * 10)}d ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
        lastError: Math.random() > 0.8 ? "Database connection timeout" : undefined,
      }));
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRunTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: "running" } : task
      )
    );

    // Simulate task completion after 3 seconds
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, status: "completed" } : task
        )
      );
    }, 3000);
  };

  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    // Fetch fresh data here
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100 mt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Server className="text-blue-600" /> System Maintenance
        </h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-shadow shadow-md"
        >
          <RefreshCcw size={18} /> Refresh
        </button>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-5 rounded-2xl shadow-md flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform">
          <p className="text-gray-500">Active Users</p>
          <h2 className="text-2xl font-bold">{status.activeUsers}</h2>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-md flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform">
          <p className="text-gray-500">Server Load</p>
          <h2 className="text-2xl font-bold">{status.serverLoad}%</h2>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-md flex flex-col items-center gap-2 hover:scale-[1.02] transition-transform">
          <p className="text-gray-500">Uptime</p>
          <h2 className="text-2xl font-bold">{status.uptime}</h2>
        </div>
      </div>

      {/* Errors */}
      {status.lastError && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center gap-2 mb-6">
          <AlertCircle /> {status.lastError}
        </div>
      )}

      {/* Maintenance Tasks */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          Maintenance Tasks
        </h2>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-inner"
            >
              <span>{task.name}</span>
              <div className="flex items-center gap-2">
                {task.status === "completed" && (
                  <CheckCircle className="text-green-500" />
                )}
                {task.status === "running" && (
                  <Play className="animate-spin text-blue-500" />
                )}
                {task.status === "pending" && (
                  <button
                    onClick={() => handleRunTask(task.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                  >
                    Run
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemMaintenancePage;
