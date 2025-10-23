"use client";

import { useEffect, useState, useRef, type JSX } from "react";
import { Clock, User, CheckCircle, XCircle } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
  time: string;
  image_url: string | null;
  goingCount?: number;
  notGoingCount?: number;
  notSureCount?: number;
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
  const [, setNormalAnnouncements] = useState<Announcement[]>([]);
  const [user, setUser] = useState<Student | Teacher | null>(null);
  const [userResponse, setUserResponse] = useState<Record<string, "going" | "notGoing" | "notSure" | null>>({});
  const [current, setCurrent] = useState<number>(0);

  const slideInterval = useRef<number | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const token = localStorage.getItem("studentToken");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/announcements`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch announcements");
        const json = await res.json();

        if (Array.isArray(json.data)) {
          const mappedAnnouncements: Announcement[] = json.data.map((a: any) => ({
            id: a.id,
            title: a.title,
            description: a.content,
            author: a.author,
            date: a.date,
            time: new Date(a.date).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            image_url: a.image_url,
            goingCount: a.goingCount ?? 0,
            notGoingCount: a.notGoingCount ?? 0,
            notSureCount: a.notSureCount ?? 0,
          }));

          setAnnouncementsOfTheMonth(mappedAnnouncements.slice(0, 3));
          setNormalAnnouncements(mappedAnnouncements.slice(3));
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
          headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache", Pragma: "no-cache" },
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const json = await res.json();
        if (json.data) setUser(json.data);
      } catch (err) {
        console.error("Error fetching user:", err);
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

  const handleResponse = async (announcementId: string, response: "going" | "notGoing" | "notSure") => {
    if (!user) return;
    const current = userResponse[announcementId];
    const newResponse = current === response ? null : response;

    setAnnouncementsOfTheMonth((prev) =>
      prev.map((a) => {
        if (a.id !== announcementId) return a;
        let goingCount = a.goingCount ?? 0;
        let notGoingCount = a.notGoingCount ?? 0;
        let notSureCount = a.notSureCount ?? 0;
        if (current === "going") goingCount = Math.max(0, goingCount - 1);
        if (current === "notGoing") notGoingCount = Math.max(0, notGoingCount - 1);
        if (current === "notSure") notSureCount = Math.max(0, notSureCount - 1);
        if (newResponse === "going") goingCount += 1;
        if (newResponse === "notGoing") notGoingCount += 1;
        if (newResponse === "notSure") notSureCount += 1;
        return { ...a, goingCount, notGoingCount, notSureCount };
      })
    );
    setUserResponse(prev => ({ ...prev, [announcementId]: newResponse }));

    try {
      const token = localStorage.getItem("studentToken");
      if (!token) throw new Error("No token");
      await fetch(`${API_URL}/announcements/${announcementId}/response`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response: newResponse }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-100 min-h-screen pt-20 m-0">
      {/* Modern Label */}
      <h1 className="text-2xl md:text-4xl font-extrabold text-indigo-800 drop-shadow-md mb-4">
        📢 Announcement of the Month
      </h1>

      {/* Carousel */}
      {/* Carousel */}
<div className="relative w-full h-72 md:h-96 rounded-3xl overflow-hidden">
  {announcementsOfTheMonth.map((a, i) => {
    const dateObj = new Date(a.date);
    const formattedDate = dateObj.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = dateObj.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return (
      <div
        key={a.id}
        className={`absolute inset-0 transition-opacity duration-1000 rounded-3xl overflow-hidden ${
          i === current ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}
      >
        {/* Card Container */}
        <div
          className="w-full h-full relative rounded-3xl shadow-2xl overflow-hidden"
          style={{
            backgroundImage: `url(${a.image_url || "/images/default.jpg"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay for smooth opacity effect */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Card content */}
          <div className="relative z-10 flex flex-col justify-end h-full p-4 md:p-6 text-white">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-600 text-sm md:text-base font-medium mb-2 shadow-lg">
              New
            </span>
            <h2 className="text-xl md:text-3xl font-bold drop-shadow-lg line-clamp-2">{a.title}</h2>
            <p className="mt-1 md:mt-2 text-sm md:text-lg drop-shadow-sm line-clamp-3">{a.description}</p>
            <div className="mt-3 md:mt-4 flex items-center gap-2 md:gap-4 text-xs md:text-sm opacity-90">
              <User className="h-4 w-4 md:h-5 md:w-5" />
              <span>{a.author}</span>
              <Clock className="h-4 w-4 md:h-5 md:w-5" />
              <span>
                {formattedDate} at {formattedTime}
              </span>
            </div>
            {/* Response Buttons */}
            <div className="flex gap-4 mt-3 text-white text-sm select-none">
              <button
                aria-label="Going"
                title="Going"
                onClick={() => handleResponse(a.id, "going")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  userResponse[a.id] === "going"
                    ? "bg-green-700 shadow-md"
                    : "bg-green-600 hover:bg-green-700"
                } transition`}
              >
                <CheckCircle size={18} />
                {a.goingCount ?? 0}
              </button>
              <button
                aria-label="Not Going"
                title="Not Going"
                onClick={() => handleResponse(a.id, "notGoing")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  userResponse[a.id] === "notGoing"
                    ? "bg-red-700 shadow-md"
                    : "bg-red-600 hover:bg-red-700"
                } transition`}
              >
                <XCircle size={18} />
                {a.notGoingCount ?? 0}
              </button>
              <button
                aria-label="Not Sure"
                title="Not Sure"
                onClick={() => handleResponse(a.id, "notSure")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  userResponse[a.id] === "notSure"
                    ? "bg-yellow-700 shadow-md"
                    : "bg-yellow-600 hover:bg-yellow-700"
                } transition`}
              >
                ?
                {a.notSureCount ?? 0}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>

    </div>
  );
}
