import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io, type Socket } from "socket.io-client";

type User = {
  id: number;
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
  lastMessage?: string;
  lastUpdated?: string;
};

type Message = {
  id: string;
  senderId: number;
  content: string;
  fromCurrentUser: boolean;
  timestamp?: string;
};

export const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contactIdParam = queryParams.get("contactId");
  const contactIdNum = contactIdParam ? parseInt(contactIdParam) : null;

  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [, setLoadingMessages] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUserId = Number(localStorage.getItem("studentId"));
  const currentUserName = localStorage.getItem("studentName") || "You";
  const token = localStorage.getItem("studentToken");

  // ---------------- SOCKET INIT ----------------
  useEffect(() => {
    if (!token) return console.error("No auth token found");

    const socket = io("http://localhost:5000", { auth: { token } });
    socketRef.current = socket;

    socket.on("message", (msg: any) => {
      const fromCurrentUser = Number(msg.sender_id) === currentUserId;

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev; // prevent duplicates
        return [
          ...prev,
          {
            id: msg.id,
            senderId: Number(msg.sender_id),
            content: msg.text,
            fromCurrentUser,
            timestamp: msg.created_at || new Date().toISOString(),
          },
        ];
      });

      // Move user to top if it's not from current user
      if (!fromCurrentUser) {
        setUsers((prevUsers) => {
          const idx = prevUsers.findIndex((u) => u.id === Number(msg.sender_id));
          if (idx === -1) return prevUsers;
          const updatedUser = { 
            ...prevUsers[idx], 
            lastMessage: msg.text, 
            lastUpdated: msg.created_at 
          };
          return [updatedUser, ...prevUsers.filter((u) => u.id !== updatedUser.id)];
        });
      }
    });

    socket.on("connect_error", (err) =>
      console.error("Socket connection error:", err)
    );

    return () => {
      socket.disconnect();
    };
  }, [token, currentUserId]);

  // ---------------- FETCH USERS ----------------
  useEffect(() => {
    async function fetchUsersAndLastChat() {
      if (!token) return;

      try {
        const headers: HeadersInit = { Authorization: `Bearer ${token}` };

        const [resLast, resUsers] = await Promise.all([
          fetch("/api/lastChats/last-messages", { headers }),
          fetch("/api/contacts", { headers }),
        ]);

        if (!resLast.ok || !resUsers.ok) throw new Error("Failed to fetch");

        const lastChats: {
          userId: number;
          userName: string;
          lastMessage: string;
          lastUpdated: string;
        }[] = await resLast.json();

        const data: User[] = await resUsers.json();

        const usersWithAvatars: User[] = data.map((u) => {
          const lastChat = lastChats.find((c) => c.userId === u.id);
          return {
            ...u,
            avatar: u.name[0].toUpperCase(),
            lastMessage: lastChat?.lastMessage,
            lastUpdated: lastChat?.lastUpdated,
          };
        });

        // Sort by last message date descending
        usersWithAvatars.sort((a, b) =>
          (b.lastUpdated || "").localeCompare(a.lastUpdated || "")
        );

        setUsers(usersWithAvatars);

        // Determine default selected user
        let defaultUser: User | null = null;

        if (contactIdNum) {
          defaultUser = usersWithAvatars.find((u) => u.id === contactIdNum) || null;
        } else {
          defaultUser = usersWithAvatars[0] || null;
        }

        setSelectedUser(defaultUser);
      } catch (err) {
        console.error(err);
      }
    }

    fetchUsersAndLastChat();
  }, [token]);

  // ---------------- LOAD MESSAGE HISTORY ----------------
  useEffect(() => {
    const socket = socketRef.current;
    if (!selectedUser || !socket) return;

    setLoadingMessages(true);

    socket.timeout(5000).emit(
      "getMessageHistory",
      { userId: selectedUser.id },
      (
        err?: string | null,
        data?: { chatId: string; messages: any[] }
      ) => {
        if (err) {
          console.warn("getMessageHistory error:", err);
          setLoadingMessages(false);
          return;
        }

        if (data) {
          setCurrentChatId(data.chatId);
          setMessages(
            data.messages.map((m) => ({
              id: m.id,
              senderId: Number(m.sender_id),
              content: m.text,
              fromCurrentUser: Number(m.sender_id) === currentUserId,
              timestamp: new Date(m.createdAt || m.created_at).toISOString(),
            }))
          );
        } else {
          setMessages([]);
        }

        setLoadingMessages(false);
      }
    );
  }, [selectedUser, currentUserId]);

  // ---------------- UPDATE URL ----------------
  useEffect(() => {
    if (!selectedUser || users.length === 0) return;
    const currentParams = new URLSearchParams(location.search);
    if (currentParams.get("contactId") !== String(selectedUser.id)) {
      navigate(`/student/message?contactId=${selectedUser.id}`, { replace: true });
    }
  }, [selectedUser, navigate, users, location.search]);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // ---------------- SEND MESSAGE ----------------
  const handleSendMessage = (content: string) => {
    if (!selectedUser || !currentChatId || content.trim() === "") return;
  
    socketRef.current?.emit("sendMessage", {
      chatId: currentChatId,
      toUserId: selectedUser.id,
      content,
    });
  
    setUsers((prevUsers) => {
      const idx = prevUsers.findIndex((u) => u.id === selectedUser.id);
      if (idx === -1) return prevUsers;
      const updatedUser = { 
        ...prevUsers[idx], 
        lastMessage: content, 
        lastUpdated: new Date().toISOString() 
      };
      return [updatedUser, ...prevUsers.filter((u) => u.id !== updatedUser.id)];
    });
  };
  
  return (
    <div className="h-full min-h-screen bg-white flex flex-col md:flex-row">
      {/* -------- USERS LIST -------- */}
      <div className="w-full md:w-64 border-r border-gray-300 flex flex-col mt-10 h-[calc(100vh-2.5rem)]">
        <div className="p-4 border-b border-gray-300 flex-shrink-0">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-blue-50 ${
                selectedUser?.id === user.id ? "bg-blue-100 font-semibold" : ""
              }`}
              onClick={() => setSelectedUser(user)}
            >
              {user.avatar && (
                <span className="inline-block w-6 h-6 rounded-full bg-blue-400 text-white text-xs font-bold mr-2 text-center">
                  {user.avatar}
                </span>
              )}
              <div className="flex flex-col">
                <span>{user.name}</span>
                {user.lastMessage && (
                  <span className="text-xs text-gray-500 truncate">{user.lastMessage}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* -------- CHAT PANE -------- */}
      <div className="flex-1 flex flex-col mt-10 h-[calc(100vh-2.5rem)]">
        <header className="p-4 border-b border-gray-300">
          <h2 className="text-xl font-semibold">
            {selectedUser ? `Chat with ${selectedUser.name}` : "Select a user to chat"}
          </h2>
        </header>

        <main
          className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3"
          ref={scrollRef}
        >
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 items-end ${
                  msg.fromCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                {/* Left avatar */}
                {!msg.fromCurrentUser && selectedUser?.avatar && (
                  <div className="w-6 h-6 rounded-full bg-blue-400 text-white text-xs flex items-center justify-center font-bold">
                    {selectedUser.avatar}
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`max-w-xs p-3 rounded-lg break-words ${
                    msg.fromCurrentUser
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none shadow"
                  }`}
                >
                  <p>{msg.content}</p>
                  <span className="text-xs text-gray-400 block mt-1">
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>

                {/* Right avatar */}
                {msg.fromCurrentUser && (
                  <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-bold">
                    {currentUserName[0].toUpperCase()}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No messages yet</p>
          )}
        </main>

        {selectedUser && <FooterInput onSend={handleSendMessage} />}
      </div>
    </div>
  );
};

function FooterInput({ onSend }: { onSend: (content: string) => void }) {
  const [input, setInput] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;
    onSend(input);
    setInput("");
  };

  return (
    <footer className="p-4 border-t border-gray-300">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
    </footer>
  );
}
