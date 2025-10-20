import React, { useState, useEffect, useRef } from "react";
import { Send, Users, MessageSquare, Search } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface ChatGroup {
  id: string;
  name: string;
  members: string[];
  messages: Message[];
}

export const TeacherMessages: React.FC = () => {
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<ChatGroup | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = "Teacher John"; // 👉 Replace with actual logged-in teacher name

  // Simulated message data
  useEffect(() => {
    const mockGroups: ChatGroup[] = [
      {
        id: "1",
        name: "Math Department",
        members: ["Teacher John", "Teacher Mia", "Teacher Kevin"],
        messages: [
          { id: "1", sender: "Teacher Mia", content: "Hey team, meeting at 3 PM?", timestamp: "2025-10-10T09:00" },
          { id: "2", sender: "Teacher John", content: "Sure! I’ll be there.", timestamp: "2025-10-10T09:05" },
        ],
      },
      {
        id: "2",
        name: "Grade 10 Advisory",
        members: ["Teacher John", "Teacher Alex", "Student Mark", "Student Anna"],
        messages: [
          { id: "1", sender: "Student Mark", content: "Sir, can we submit tomorrow?", timestamp: "2025-10-09T08:30" },
          { id: "2", sender: "Teacher John", content: "Yes, I’ll extend it. 👍", timestamp: "2025-10-09T08:35" },
        ],
      },
      {
        id: "3",
        name: "Science Club",
        members: ["Teacher John", "Teacher Ella", "Student Chris"],
        messages: [
          { id: "1", sender: "Teacher Ella", content: "Experiment prep next week!", timestamp: "2025-10-08T10:00" },
        ],
      },
    ];
    setGroups(mockGroups);
    setActiveGroup(mockGroups[0]);
  }, []);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeGroup?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeGroup) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: currentUser,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedGroup = {
      ...activeGroup,
      messages: [...activeGroup.messages, newMsg],
    };

    setGroups((prev) =>
      prev.map((g) => (g.id === activeGroup.id ? updatedGroup : g))
    );
    setActiveGroup(updatedGroup);
    setNewMessage("");
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] bg-white/70 rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      {/* 📋 Left Sidebar - Groups */}
      <div className="w-72 border-r border-gray-200 bg-white/60 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-indigo-700 flex items-center gap-2">
            <Users size={20} /> Groups
          </h2>
          <Search size={18} className="text-gray-400 cursor-pointer" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => setActiveGroup(group)}
              className={`p-4 cursor-pointer transition-all ${
                activeGroup?.id === group.id
                  ? "bg-indigo-100 text-indigo-800 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500 text-white w-10 h-10 flex items-center justify-center rounded-full">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <p>{group.name}</p>
                  <p className="text-xs text-gray-500">
                    {group.members.length} members
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 💬 Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeGroup ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div>
                <h2 className="font-bold text-indigo-700">{activeGroup.name}</h2>
                <p className="text-xs text-gray-500">
                  {activeGroup.members.join(", ")}
                </p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {activeGroup.messages.map((msg) => {
                const isMine = msg.sender === currentUser;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl ${
                        isMine
                          ? "bg-indigo-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-[10px] opacity-70 mt-1 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="bg-indigo-500 text-white p-2 rounded-full hover:bg-indigo-600 transition"
              >
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Select a group to start chatting 💬</p>
          </div>
        )}
      </div>
    </div>
  );
};
