import React, { useEffect, useState } from "react";
import { Calendar, Users, CheckCircle, XCircle, Plus, X } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  createdBy: string;
  goingCount: number;
  notGoingCount: number;
  isUpcoming?: boolean;
  category?: string;
  image?: string; // store URL of uploaded file
  priority?: string;
  type?: string;
  author?: string;
  time?: string;
  place?: string;
}

interface AnnouncementForm {
  title: string;
  description: string;
  category: string;
  image?: File;
  priority: string;
  type: string;
  author: string;
  date: string;
  time: string;
  place: string;
}

const courses = ["BSIS", "BSENTREP", "BSAIS", "BSCRIM"];
const priorities = ["Normal", "High", "Urgent"];
const announcementTypes = ["Normal Announcement", "Announcement of the Month"];

export const TeacherAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [, setTeacherAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState({
    totalGoing: 0,
    totalNotGoing: 0,
    upcomingEvents: 0,
    monthGoing: 0,
    monthNotGoing: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentTeacher = "teacher123"; // replace with auth context

  const [formData, setFormData] = useState<AnnouncementForm>({
    title: "",
    description: "",
    category: courses[0],
    image: undefined,
    priority: priorities[0],
    type: announcementTypes[0],
    author: currentTeacher,
    date: "",
    time: "",
    place: "",
  });

  useEffect(() => {
    // Mock data
    const mockData: Announcement[] = [
      {
        id: "1",
        title: "NST Academic Fair 2025",
        description: "Join us for the annual academic fair featuring all departments.",
        date: "2025-10-15",
        createdBy: "teacher123",
        goingCount: 25,
        notGoingCount: 5,
      },
      {
        id: "2",
        title: "Teachers' Meeting",
        description: "Monthly faculty meeting in the AVR room.",
        date: "2025-10-12",
        createdBy: "teacher456",
        goingCount: 15,
        notGoingCount: 2,
      },
      {
        id: "3",
        title: "Science Month Exhibit",
        description: "All science teachers must prepare their exhibits.",
        date: "2025-11-05",
        createdBy: "teacher123",
        goingCount: 20,
        notGoingCount: 1,
      },
    ];

    setAnnouncements(mockData);
    setTeacherAnnouncements(mockData.filter(a => a.createdBy === currentTeacher));

    const totalGoing = mockData.reduce((sum, a) => sum + a.goingCount, 0);
    const totalNotGoing = mockData.reduce((sum, a) => sum + a.notGoingCount, 0);
    const upcomingEvents = mockData.filter(a => new Date(a.date) > new Date()).length;
    const monthNow = new Date().getMonth();
    const monthGoing = mockData.filter(a => new Date(a.date).getMonth() === monthNow)
                               .reduce((sum, a) => sum + a.goingCount, 0);
    const monthNotGoing = mockData.filter(a => new Date(a.date).getMonth() === monthNow)
                                  .reduce((sum, a) => sum + a.notGoingCount, 0);

    setStats({ totalGoing, totalNotGoing, upcomingEvents, monthGoing, monthNotGoing });
  }, []);

  const handleSaveAnnouncement = () => {
    const newAnnouncement: Announcement = {
      id: (announcements.length + 1).toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      type: formData.type,
      author: formData.author,
      date: formData.date || new Date().toISOString(),
      time: formData.time,
      place: formData.place,
      createdBy: currentTeacher,
      goingCount: 0,
      notGoingCount: 0,
      image: formData.image ? URL.createObjectURL(formData.image) : undefined,
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setTeacherAnnouncements(prev => [newAnnouncement, ...prev]);
    setIsModalOpen(false);
    setFormData({
      title: "",
      description: "",
      category: courses[0],
      image: undefined,
      priority: priorities[0],
      type: announcementTypes[0],
      author: currentTeacher,
      date: "",
      time: "",
      place: "",
    });
  };

  return (
    <div className="space-y-8">
      {/* Create Announcement Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md"
        >
          <Plus size={18} />
          Create Announcement
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/70 p-4 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Going</p>
            <h2 className="text-2xl font-bold text-green-600">{stats.totalGoing}</h2>
          </div>
          <CheckCircle className="text-green-500" size={32} />
        </div>
        <div className="bg-white/70 p-4 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Not Going</p>
            <h2 className="text-2xl font-bold text-red-600">{stats.totalNotGoing}</h2>
          </div>
          <XCircle className="text-red-500" size={32} />
        </div>
        <div className="bg-white/70 p-4 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Upcoming Events</p>
            <h2 className="text-2xl font-bold text-indigo-600">{stats.upcomingEvents}</h2>
          </div>
          <Calendar className="text-indigo-500" size={32} />
        </div>
        <div className="bg-white/70 p-4 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">This Month’s Going / Not Going</p>
            <h2 className="text-xl font-bold text-blue-600">
              {stats.monthGoing} / {stats.monthNotGoing}
            </h2>
          </div>
          <Users className="text-blue-500" size={32} />
        </div>
      </div>

      {/* Announcements List */}
      <section>
        <h2 className="text-xl font-bold text-indigo-700 mb-3">All Announcements</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {announcements.map(a => (
            <div
              key={a.id}
              className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-md border-l-4 border-indigo-400"
            >
              <h3 className="text-lg font-semibold text-gray-800">{a.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{a.description}</p>
              {a.image && <img src={a.image} className="w-full h-40 object-cover rounded-lg mb-2" />}
              <p className="text-xs text-gray-400">
                📅 {new Date(a.date).toLocaleDateString()} • Posted by {a.createdBy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl p-6 relative overflow-auto max-h-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Create Announcement</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full border rounded-lg p-2"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
              <textarea
                placeholder="Description"
                className="w-full border rounded-lg p-2"
                rows={4}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {courses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
              >
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                {announcementTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
              <input
                type="time"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
              <input
                type="text"
                placeholder="Place"
                value={formData.place}
                onChange={e => setFormData({ ...formData, place: e.target.value })}
              />
              <input
                type="file"
                accept="image/*"
                onChange={e => setFormData({ ...formData, image: e.target.files?.[0] })}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button onClick={handleSaveAnnouncement}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
