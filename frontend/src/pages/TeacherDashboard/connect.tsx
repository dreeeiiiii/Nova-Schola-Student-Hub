"use client";

import { useEffect, useState } from "react";
import {
  Search,
  MessageSquare,
  Mail,
  Phone,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Contact {
  avatar: string;
  id: string;
  name: string;
  email: string;
  contactid: string;
  department: string;
  role: string;
  status: string;
  specialization?: string | null;
  degree?: string | null;
  experience_years?: number | null;
  yearlevel?: string | null;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function ConnectPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | "Teachers" | "Students"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);

  const token =
    localStorage.getItem("teacherToken") ||
    localStorage.getItem("studentToken");

  const navigate = useNavigate();

  // ---------------- Fetch Contacts ----------------
  useEffect(() => {
    async function fetchContacts() {
      try {
        const url =
          selectedCategory === "All"
            ? `${API_URL}/contacts`
            : `${API_URL}/contacts?role=${selectedCategory.toLowerCase()}`;

        const headers: HeadersInit = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(url, { headers });
        const json = await res.json();
        const data: Contact[] = Array.isArray(json) ? json : json.data || [];
        setContacts(data);
        setVisibleCount(20); // reset when category changes
      } catch (error) {
        console.error("❌ Failed to load contacts:", error);
      }
    }
    fetchContacts();
  }, [selectedCategory, token]);

  // ---------------- Utilities ----------------
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-400";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleContacts = filteredContacts.slice(0, visibleCount);

  // ---------------- Render ----------------
  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-r from-blue-50 to-purple-50 text-sm pt-20">
      {/* Header (fixed top) */}
      <header className="flex-none max-w-6xl w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-4 p-4 md:p-6 bg-white shadow-md rounded-xl">
        <h1 className="text-2xl font-semibold text-purple-700">
          Connect with Teachers & Students
        </h1>

        {/* Category Filter Tabs */}
        <div className="flex gap-2 bg-gray-100 rounded-lg shadow-inner overflow-hidden text-xs">
          {["All", "Teachers", "Students"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-3 py-1 rounded-lg transition ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-600 hover:bg-purple-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, role, or department"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {!selectedContact ? (
          <ContactsGrid
            contacts={visibleContacts}
            getStatusColor={getStatusColor}
            onSelect={setSelectedContact}
            navigate={navigate}
          />
        ) : (
          <ContactProfile
            contact={selectedContact}
            getStatusColor={getStatusColor}
            onBack={() => setSelectedContact(null)}
          />
        )}

        {!selectedContact && visibleCount < filteredContacts.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setVisibleCount((prev) => prev + 20)}
              className="px-4 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- Contacts Grid ----------------
function ContactsGrid({
  contacts,
  getStatusColor,
  onSelect,
  navigate,
}: {
  contacts: Contact[];
  getStatusColor: (s: string) => string;
  onSelect: (c: Contact) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  if (!contacts.length) {
    return (
      <p className="max-w-6xl mx-auto text-center py-20 text-gray-500">
        No contacts found.
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          getStatusColor={getStatusColor}
          onSelect={onSelect}
          navigate={navigate}
        />
      ))}
    </div>
  );
}

// ---------------- Contact Card ----------------
function ContactCard({
  contact,
  getStatusColor,
  onSelect,
  navigate,
}: {
  contact: Contact;
  getStatusColor: (s: string) => string;
  onSelect: (c: Contact) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const avatarLetters =
    contact.avatar ||
    contact.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

  return (
    <div
      className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 flex flex-col cursor-pointer"
      onClick={() => onSelect(contact)}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className="relative rounded-full flex items-center justify-center text-white font-bold"
          style={{
            backgroundColor: `hsl(${avatarLetters.charCodeAt(0) * 10}, 70%, 50%)`,
            width: 56,
            height: 56,
            fontSize: 20,
          }}
        >
          {avatarLetters}
          <span
            className={`absolute -bottom-1 -right-1 h-4 w-4 ${getStatusColor(
              contact.status
            )} border border-white rounded-full`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{contact.name}</h3>
          <p className="text-xs text-gray-600 truncate">
            {contact.role} • {contact.department}
          </p>
        </div>
      </div>

      <div className="mt-auto flex justify-between gap-2">
<button
onClick={(e) => {
  e.stopPropagation();
  // Navigate to TeacherMessages page with contactId query
  navigate(`/teacher/messages?contactId=${contact.id}`, {
    state: { contactName: contact.name }, // optional, in case you want to display name
  });
}}
className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 rounded-lg text-white text-xs hover:bg-purple-700 transition"
>
<MessageSquare className="h-4 w-4" /> Message
</button>


        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(contact);
          }}
          className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 text-xs hover:bg-gray-100 transition"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

// ---------------- Contact Profile ----------------
function ContactProfile({
  contact,
  getStatusColor,
  onBack,
}: {
  contact: Contact;
  getStatusColor: (s: string) => string;
  onBack: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-6">
      <button
        onClick={onBack}
        className="self-start px-3 py-1 text-purple-600 hover:underline"
      >
        ← Back to Contacts
      </button>

      <div className="flex items-center gap-6">
        <div
          className="relative rounded-full flex items-center justify-center text-white font-bold"
          style={{
            backgroundColor: `hsl(${contact.name.charCodeAt(0) * 10}, 70%, 50%)`,
            width: 80,
            height: 80,
            fontSize: 32,
          }}
        >
          {contact.avatar}
          <span
            className={`absolute -bottom-2 -right-2 h-6 w-6 ${getStatusColor(
              contact.status
            )} border-4 border-white rounded-full`}
          />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <h2 className="text-3xl font-bold truncate">{contact.name}</h2>
          <p className="text-lg text-gray-700 truncate">
            {contact.role} • {contact.department}
          </p>
          {contact.yearlevel && <p className="text-gray-500">{contact.yearlevel}</p>}
        </div>
      </div>

      <section>
        <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <span>{contact.email}</span>
          </li>
          <li className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <span>{contact.contactid || "N/A"}</span>
          </li>
        </ul>
      </section>

      {contact.specialization && (
        <section>
          <h3 className="text-xl font-semibold mb-2">Specialization</h3>
          <p className="text-gray-700">{contact.specialization}</p>
        </section>
      )}

      {contact.degree && (
        <section>
          <h3 className="text-xl font-semibold mb-2">Degree</h3>
          <p className="text-gray-700">{contact.degree}</p>
        </section>
      )}

      {contact.experience_years !== undefined && (
        <section>
          <h3 className="text-xl font-semibold mb-2">Experience</h3>
          <p className="text-gray-700">{contact.experience_years} years</p>
        </section>
      )}

      {contact.yearlevel && (
        <section>
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-purple-600" /> Year Level
          </h3>
          <p className="text-gray-700">{contact.yearlevel}</p>
        </section>
      )}
    </div>
  );
}
