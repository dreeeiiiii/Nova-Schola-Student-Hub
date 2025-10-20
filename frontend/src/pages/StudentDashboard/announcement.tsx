"use client";

import { useEffect, useState, useRef, type JSX } from "react";
import { Bell, Clock, User } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
  time: string;
  image_url: string | null;
}

interface Student {
  id: string;
  name: string;
  email: string;
  role: "student";
  studentid: string;
  yearlevel: string;
  department: string;
  created_at: string;
  updated_at: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: "teacher";
  teacherid: string;
  department: string;
  specialization: string;
  created_at: string;
  updated_at: string;
}

export default function AnnouncementOfTheMonth(): JSX.Element {
  const [announcementsOfTheMonth, setAnnouncementsOfTheMonth] = useState<Announcement[]>([]);
  const [normalAnnouncements, setNormalAnnouncements] = useState<Announcement[]>([]);
  const [user, setUser] = useState<Student | Teacher | null>(null);
  const [current, setCurrent] = useState(0);
  const slideInterval = useRef<number | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const token = localStorage.getItem("studentToken");
      if (!token) {
        console.warn("No token found, cannot fetch announcements.");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/announcements`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          cache: "no-store",
        });

        if (res.status === 304) {
          console.log("Announcements not modified, using cached data.");
          return;
        }

        const json = await res.json();
        if (res.ok && Array.isArray(json.data)) {
          setAnnouncementsOfTheMonth(json.data.slice(0, 3));
          setNormalAnnouncements(json.data.slice(3));
        } else {
          console.warn("Failed to fetch announcements:", json);
        }
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      }
    };
    fetchAnnouncements();
  }, [API_URL]);

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          cache: "no-store",
        });

        if (res.status === 304) {
          console.log("User data not modified, using cached data.");
          return;
        }

        const json = await res.json();
        if (res.ok && json.data) {
          setUser(json.data);
        } else {
          console.warn("Failed to fetch user:", json.message);
        }
      } catch (err) {
        console.error("Error fetching student:", err);
      }
    };

    fetchUser();
  }, [API_URL]);

  useEffect(() => {
    if (!announcementsOfTheMonth.length) return;
    slideInterval.current = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % announcementsOfTheMonth.length);
    }, 5000);
    return () => {
      if (slideInterval.current) window.clearInterval(slideInterval.current);
    };
  }, [announcementsOfTheMonth]);

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-100 min-h-screen">
      {/* Carousel */}
      <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg">
        {announcementsOfTheMonth.map((a, i) => (
          <div
            key={a.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div
              className="w-full h-full flex flex-col justify-end p-4 md:p-6 text-white bg-indigo-500 bg-cover bg-center"
              style={{
                backgroundImage: `url(${
                  a.image_url || "/images/default.jpg"
                })`,
                backgroundBlendMode: "overlay",
              }}
            >
              <h2 className="text-xl md:text-3xl font-bold drop-shadow-md line-clamp-2">{a.title}</h2>
              <p className="mt-1 md:mt-2 text-sm md:text-lg drop-shadow-sm line-clamp-3">{a.description}</p>
              <div className="mt-3 md:mt-4 flex items-center gap-2 md:gap-4 text-xs md:text-sm opacity-90">
                <User className="h-4 w-4 md:h-5 md:w-5" />
                <span>{a.author}</span>
                <Clock className="h-4 w-4 md:h-5 md:w-5" />
                <span>
                  {a.date} at {a.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* User Info */}
        <div className="border border-indigo-200 rounded-xl p-4 md:p-6 flex items-center gap-3 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg transition">
          <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg md:text-xl font-bold">
            {user ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "??"}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">{user?.name || "Loading..."}</h3>
            <p className="text-xs md:text-sm text-gray-500">{user?.department || "Fetching department..."}</p>
          </div>
        </div>

        {/* Announcement Count */}
        <div className="p-4 md:p-6 bg-white rounded-xl shadow-md flex items-center gap-2 md:gap-3 border-l-4 border-indigo-500">
          <Bell className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
          <div>
            <p className="text-xs md:text-sm text-gray-500">Announcements</p>
            <p className="text-xl md:text-2xl font-semibold text-gray-800">
              {announcementsOfTheMonth.length + normalAnnouncements.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
