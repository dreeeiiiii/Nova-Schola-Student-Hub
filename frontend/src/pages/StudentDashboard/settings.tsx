"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  ShieldAlert,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Flag,
  HelpCircle,
} from "lucide-react";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("security");
  const [activeStatus, setActiveStatus] = useState(true);
  const [securityAlerts] = useState([
    { id: 1, message: "New login from Chrome on Windows", time: "2 hours ago", safe: true },
    { id: 2, message: "Password changed", time: "3 days ago", safe: true },
    { id: 3, message: "Failed login attempt", time: "1 week ago", safe: false },
  ]);
  const [recentLogins] = useState([
    { id: 1, device: "Chrome on Windows", time: "Today, 10:00 AM", current: true },
    { id: 2, device: "Firefox on MacOS", time: "Yesterday, 8:45 PM", current: false },
    { id: 3, device: "Safari on iPhone", time: "2 days ago", current: false },
  ]);
  const [problemDescription, setProblemDescription] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const submitReport = () => {
    if (problemDescription.trim().length === 0) {
      alert("Please enter a description before submitting.");
      return;
    }
    setReportSubmitted(true);
    setTimeout(() => {
      setProblemDescription("");
      setReportSubmitted(false);
      alert("Report submitted successfully. Thank you!");
    }, 1000);
  };

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) {
      setShowContent(true);
    }
  };

  const goBack = () => {
    setShowContent(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col md:flex-row max-w-5xl mx-auto pt-20 gap-6 p-4">
      {/* Mobile: show sidebar or content */}
      {isMobile ? (
        <>
          {!showContent ? (
            <nav className="flex flex-col gap-2 w-full text-gray-700 font-medium sticky top-20 self-start h-[calc(100vh-80px)] overflow-auto bg-white rounded-lg shadow-md p-4">
              <button
                onClick={() => handleTabSelect("security")}
                className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 transition ${
                  activeTab === "security" ? "bg-blue-100 text-blue-600 font-semibold" : ""
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
                Security Alerts
              </button>
              <button
                onClick={() => handleTabSelect("logins")}
                className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 transition ${
                  activeTab === "logins" ? "bg-blue-100 text-blue-600 font-semibold" : ""
                }`}
              >
                <Clock className="w-5 h-5" />
                Recent Logins
              </button>
              <button
                onClick={() => handleTabSelect("activeStatus")}
                className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 transition ${
                  activeTab === "activeStatus" ? "bg-blue-100 text-blue-600 font-semibold" : ""
                }`}
              >
                {activeStatus ? (
                  <ToggleRight className="w-5 h-5 text-green-600" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
                Active Status
              </button>
              <button
                onClick={() => handleTabSelect("report")}
                className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 transition ${
                  activeTab === "report" ? "bg-blue-100 text-blue-600 font-semibold" : ""
                }`}
              >
                <Flag className="w-5 h-5" />
                Report a Problem
              </button>
              <button
                onClick={() => handleTabSelect("help")}
                className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 transition ${
                  activeTab === "help" ? "bg-blue-100 text-blue-600 font-semibold" : ""
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                Help
              </button>
            </nav>
          ) : (
            <section className="flex-1 bg-white rounded-lg shadow-md p-4 overflow-auto max-h-[calc(100vh-80px)] relative">
              <button
                onClick={goBack}
                className="mb-4 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                ← Back
              </button>

              {activeTab === "security" && (
                <>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Security Alerts</h2>
                  <ul className="divide-y divide-gray-200">
                    {securityAlerts.map((alert) => (
                      <li key={alert.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {alert.safe ? (
                            <CheckCircle className="text-green-500 w-6 h-6" />
                          ) : (
                            <ShieldAlert className="text-red-500 w-6 h-6" />
                          )}
                          <p className={`text-gray-700 ${!alert.safe ? "font-semibold" : ""}`}>
                            {alert.message}
                          </p>
                        </div>
                        <time className="text-xs text-gray-400">{alert.time}</time>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {activeTab === "logins" && (
                <>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Logins</h2>
                  <ul className="divide-y divide-gray-200">
                    {recentLogins.map((login) => (
                      <li key={login.id} className="py-3 flex items-center justify-between">
                        <p className="text-gray-700">{login.device}</p>
                        <div className="flex items-center gap-4">
                          <time className="text-xs text-gray-400">{login.time}</time>
                          {login.current && (
                            <span className="text-sm text-green-600 font-semibold">
                              Current Session
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {activeTab === "activeStatus" && (
                <>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Active Status</h2>
                  <div className="flex items-center gap-4">
                    <p className="text-gray-700">
                      Control whether your friends see you as active or offline.
                    </p>
                    <button
                      onClick={() => setActiveStatus(!activeStatus)}
                      className={`rounded-full w-12 h-6 flex items-center cursor-pointer transition-colors ${
                        activeStatus ? "bg-green-500" : "bg-gray-300"
                      }`}
                      aria-label="Toggle Active Status"
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform ${
                          activeStatus ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </>
              )}

              {activeTab === "report" && (
                <>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Report a Problem</h2>
                  <textarea
                    className="w-full h-24 border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    placeholder="Describe the issue you're experiencing..."
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    disabled={reportSubmitted}
                  />
                  <button
                    onClick={submitReport}
                    disabled={reportSubmitted}
                    className="mt-4 px-5 py-2 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {reportSubmitted ? "Submitting..." : "Submit Report"}
                  </button>
                </>
              )}

              {activeTab === "help" && (
                <>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Help & Support</h2>
                  <p className="text-gray-700 mb-4">
                    For assistance, please visit our{" "}
                    <a href="/help" className="text-blue-600 underline">
                      Help Center
                    </a>{" "}
                    or contact support at{" "}
                    <a href="mailto:support@nst.edu.ph" className="text-blue-600 underline">
                      support@nst.edu.ph
                    </a>
                    .
                  </p>
                  <p className="text-gray-700">
                    You can find FAQs, guides, and community forums there to help answer your
                    questions.
                  </p>
                </>
              )}
            </section>
          )}
        </>
      ) : (
        // Desktop layout
        <>
          {/* Sidebar menu */}
          <nav className="flex flex-col gap-4 w-48 text-gray-700 font-medium sticky top-20 self-start h-[calc(100vh-80px)] overflow-auto">
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 ${
                activeTab === "security" ? "bg-blue-100 text-blue-600 font-semibold" : ""
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
              Security Alerts
            </button>
            <button
              onClick={() => setActiveTab("logins")}
              className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 ${
                activeTab === "logins" ? "bg-blue-100 text-blue-600 font-semibold" : ""
              }`}
            >
              <Clock className="w-5 h-5" />
              Recent Logins
            </button>
            <button
              onClick={() => setActiveTab("activeStatus")}
              className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 ${
                activeTab === "activeStatus" ? "bg-blue-100 text-blue-600 font-semibold" : ""
              }`}
            >
              {activeStatus ? (
                <ToggleRight className="w-5 h-5 text-green-600" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              )}
              Active Status
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 ${
                activeTab === "report" ? "bg-blue-100 text-blue-600 font-semibold" : ""
              }`}
            >
              <Flag className="w-5 h-5" />
              Report a Problem
            </button>
            <button
              onClick={() => setActiveTab("help")}
              className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-blue-50 ${
                activeTab === "help" ? "bg-blue-100 text-blue-600 font-semibold" : ""
              }`}
            >
              <HelpCircle className="w-5 h-5" />
              Help
            </button>
          </nav>

          {/* Content area */}
          <section className="flex-1 bg-white rounded-lg shadow-md p-6 overflow-auto max-h-[calc(100vh-80px)]">
            {activeTab === "security" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Security Alerts</h2>
                <ul className="divide-y divide-gray-200">
                  {securityAlerts.map((alert) => (
                    <li key={alert.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {alert.safe ? (
                          <CheckCircle className="text-green-500 w-6 h-6" />
                        ) : (
                          <ShieldAlert className="text-red-500 w-6 h-6" />
                        )}
                        <p className={`text-gray-700 ${!alert.safe ? "font-semibold" : ""}`}>{alert.message}</p>
                      </div>
                      <time className="text-xs text-gray-400">{alert.time}</time>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {activeTab === "logins" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Logins</h2>
                <ul className="divide-y divide-gray-200">
                  {recentLogins.map((login) => (
                    <li key={login.id} className="py-3 flex items-center justify-between">
                      <p className="text-gray-700">{login.device}</p>
                      <div className="flex items-center gap-4">
                        <time className="text-xs text-gray-400">{login.time}</time>
                        {login.current && <span className="text-sm text-green-600 font-semibold">Current Session</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {activeTab === "activeStatus" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Active Status</h2>
                <div className="flex items-center gap-4">
                  <p className="text-gray-700">Control whether your friends see you as active or offline.</p>
                  <button
                    onClick={() => setActiveStatus(!activeStatus)}
                    className={`rounded-full w-12 h-6 flex items-center cursor-pointer transition-colors ${activeStatus ? "bg-green-500" : "bg-gray-300"}`}
                    aria-label="Toggle Active Status"
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform ${
                        activeStatus ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </>
            )}

            {activeTab === "report" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Report a Problem</h2>
                <textarea
                  className="w-full h-24 border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="Describe the issue you're experiencing..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  disabled={reportSubmitted}
                />
                <button
                  onClick={submitReport}
                  disabled={reportSubmitted}
                  className="mt-4 px-5 py-2 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {reportSubmitted ? "Submitting..." : "Submit Report"}
                </button>
              </>
            )}

            {activeTab === "help" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Help & Support</h2>
                <p className="text-gray-700 mb-4">
                  For assistance, please visit our{" "}
                  <a href="/help" className="text-blue-600 underline">
                    Help Center
                  </a>{" "}
                  or contact support at{" "}
                  <a href="mailto:support@nst.edu.ph" className="text-blue-600 underline">
                    support@nst.edu.ph
                  </a>
                  .
                </p>
                <p className="text-gray-700">
                  You can find FAQs, guides, and community forums there to help answer your questions.
                </p>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
