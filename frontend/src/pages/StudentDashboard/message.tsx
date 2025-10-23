import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io, type Socket } from "socket.io-client";

type User = {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
  lastMessage?: string;
  lastUpdated?: string;
};

type Message = {
  id: string;
  senderId: string;
  content: string;
  fromCurrentUser: boolean;
  timestamp?: string;
};

// ---------------- JWT PARSER ----------------
function parseToken(token: string | null) {
  if (!token) return { id: "", name: "You" };
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { id: payload.id, name: payload.name || "You" };
  } catch {
    return { id: "", name: "You" };
  }
}

// ---------------- USER LIST HELPER ----------------
function updateUserListForMessage(
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  userId: string,
  text: string,
  date: string
) {
  setUsers((prev) => {
    const idx = prev.findIndex((u) => u.id === userId);
    if (idx === -1) return prev;

    const updated = { ...prev[idx], lastMessage: text, lastUpdated: date };
    const others = prev.filter((u) => u.id !== userId);
    return [updated, ...others].sort(
      (a, b) =>
        new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime()
    );
  });
}

// ---------------- MESSAGES PAGE ----------------
export const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const contactIdStr = new URLSearchParams(location.search).get("contactId");

  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("studentToken");
  const { id: currentUserId, name: currentUserName } = parseToken(token);

  // ---------------- SOCKET INIT ----------------
  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_API_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => console.log("Socket connected!", socket.id));
    socket.on("connect_error", (err) => console.error("Socket error:", err));
    socket.on("disconnect", (reason) => console.log("Socket disconnected:", reason));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // ---------------- SOCKET MESSAGE LISTENER ----------------
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleMessage = (msg: any) => {
      const isFromCurrentUser = String(msg.senderId) === String(currentUserId);

      const newMsg: Message = {
        id: msg.id || msg.tempId,
        senderId: msg.senderId,
        content: msg.text,
        fromCurrentUser: isFromCurrentUser,
        timestamp: msg.createdAt || msg.created_at || new Date().toISOString(),
      };

      setMessages((prev) => {
        const newMessages = [...prev];

        // Replace optimistic message
        if (msg.tempId && isFromCurrentUser) {
          const idx = newMessages.findIndex((m) => m.id === msg.tempId);
          if (idx !== -1) {
            newMessages[idx] = newMsg;
            return newMessages;
          }
        }

        // Avoid duplicates
        if (newMessages.some((m) => m.id === newMsg.id)) return newMessages;

        newMessages.push(newMsg);
        return newMessages;
      });

      // Update user list last message
      const contactIdToUpdate = newMsg.fromCurrentUser ? selectedUser?.id : newMsg.senderId;
      if (contactIdToUpdate) {
        updateUserListForMessage(setUsers, contactIdToUpdate, newMsg.content, newMsg.timestamp!);
      }
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [currentUserId, selectedUser?.id, users]);

  // ---------------- FETCH USERS & LAST CHATS ----------------
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const headers: HeadersInit = { Authorization: `Bearer ${token}` };
        const [resLast, resUsers] = await Promise.all([
          fetch("/lastChats/last-messages", { headers }),
          fetch("/contacts", { headers }),
        ]);
        if (!resLast.ok || !resUsers.ok) throw new Error("Failed to fetch");

        const lastChats = await resLast.json();
        const data: User[] = await resUsers.json();

        const usersWithAvatars = data.map((u) => {
          const lastChat = lastChats.find((c: any) => c.userId === u.id);
          return {
            ...u,
            avatar: u.name[0].toUpperCase(),
            lastMessage: lastChat?.lastMessage,
            lastUpdated: lastChat?.lastUpdated,
          };
        });

        usersWithAvatars.sort(
          (a, b) =>
            new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime()
        );

        setUsers(usersWithAvatars);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [token]);

  // ---------------- SELECT USER ----------------
  useEffect(() => {
    if (!users.length) return;
    const defaultUser = contactIdStr ? users.find((u) => u.id === contactIdStr) || users[0] : users[0];
    if (defaultUser && defaultUser.id !== selectedUser?.id) setSelectedUser(defaultUser);
  }, [users, contactIdStr]);

  // ---------------- LOAD MESSAGES ----------------
  useEffect(() => {
    const socket = socketRef.current;
    if (!selectedUser || !socket) return;

    setLoadingChat(true);
    socket.emit(
      "getMessageHistory",
      { userId: selectedUser.id },
      (data: { status: string; chatId?: string; messages?: any[]; error?: string }) => {
        if (data.status === "error") {
          console.warn("getMessageHistory error:", data.error);
          setMessages([]);
          setCurrentChatId(null);
          setLoadingChat(false);
          return;
        }

        setCurrentChatId(data.chatId || null);
        setMessages(
          (data.messages || []).map((m) => ({
            id: m.id,
            senderId: m.senderId,
            content: m.text,
            fromCurrentUser: m.senderId === currentUserId,
            timestamp: new Date(m.createdAt || m.created_at || Date.now()).toISOString(),
          }))
        );

        setLoadingChat(false);
      }
    );
  }, [selectedUser, currentUserId]);

  // ---------------- UPDATE URL ----------------
  useEffect(() => {
    if (!selectedUser || !users.length) return;
    const params = new URLSearchParams(location.search);
    if (params.get("contactId") !== selectedUser.id) {
      navigate(`/student/message?contactId=${selectedUser.id}`, { replace: true });
    }
  }, [selectedUser, users, navigate, location.search]);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // ---------------- SCREEN RESPONSIVENESS ----------------
  useEffect(() => {
    const checkScreen = () => setIsSmallScreen(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // ---------------- SEND MESSAGE ----------------
  const handleSendMessage = (content: string) => {
    if (!selectedUser || !currentChatId || content.trim() === "") return;
    const tempId = "temp-" + Date.now();

    setMessages((prev) => [
      ...prev,
      { id: tempId, senderId: currentUserId, content, fromCurrentUser: true, timestamp: new Date().toISOString() },
    ]);
    updateUserListForMessage(setUsers, selectedUser.id, content, new Date().toISOString());

    socketRef.current?.emit("sendMessage", { chatId: currentChatId, toUserId: selectedUser.id, content, tempId });
  };

  // ---------------- HELPER: GET AVATAR ----------------
  const getAvatarForMessage = (msg: Message) => {
    if (msg.fromCurrentUser) return currentUserName[0].toUpperCase();
    const user = users.find(u => u.id === msg.senderId);
    return user?.avatar || "?";
  };

  // ---------------- RENDER ----------------
  return (
    <div className="h-full min-h-screen bg-white flex flex-col md:flex-row">
      {/* USERS LIST */}
      <div className={`border-r border-gray-300 flex flex-col mt-10 h-[calc(100vh-2.5rem)] ${isSmallScreen ? (selectedUser ? "hidden" : "w-full") : "w-64"}`}>
        <div className="p-4 border-b border-gray-300 flex-shrink-0">
          <input type="text" placeholder="Search users..." className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map((user) => (
            <button key={user.id} className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-blue-50 ${selectedUser?.id === user.id ? "bg-blue-100 font-semibold" : ""}`} onClick={() => setSelectedUser(user)}>
              {user.avatar && <span className="inline-block w-6 h-6 rounded-full bg-blue-400 text-white text-xs font-bold mr-2 text-center">{user.avatar}</span>}
              <div className="flex flex-col">
                <span>{user.name}</span>
                {user.lastMessage && <span className="text-xs text-gray-500 truncate">{user.lastMessage}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CHAT PANE */}
      <div className={`flex-1 flex flex-col mt-10 h-[calc(100vh-2.5rem)] ${isSmallScreen ? (selectedUser ? "flex w-full" : "hidden") : "flex w-auto"}`}>
        <header className="p-4 border-b border-gray-300 flex items-center justify-between">
          {isSmallScreen && selectedUser && <button onClick={() => setSelectedUser(null)} className="text-blue-600 hover:underline">← Back</button>}
          <h2 className="text-xl font-semibold flex-1 text-center">{selectedUser ? `Chat with ${selectedUser.name}` : "Select a user to chat"}</h2>
        </header>

        <main className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3" ref={scrollRef}>
          {loadingChat ? Array.from({ length: 5 }).map((_, idx) => <div key={idx} className="h-10 bg-gray-200 rounded animate-pulse w-3/4"></div>) :
            messages.length > 0 ? messages.map((msg) => (
              <div key={msg.id} className={`chat ${msg.fromCurrentUser ? "chat-end justify-end" : "chat-start justify-start"} flex items-end`}>
                {!msg.fromCurrentUser && (
                  <div className="chat-image avatar mr-2">
                    <div className="w-8 rounded-full bg-blue-400 text-white text-xs flex items-center justify-center font-bold">
                      {getAvatarForMessage(msg)}
                    </div>
                  </div>
                )}
                <div className={`chat-bubble max-w-[75%] p-3 rounded-lg break-words text-sm shadow-sm ${msg.fromCurrentUser ? "chat-bubble-primary" : "bg-white"}`}>
                  <p>{msg.content}</p>
                  <span className="text-[11px] text-gray-300 block mt-1 text-right">{msg.timestamp && new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                {msg.fromCurrentUser && (
                  <div className="chat-image avatar ml-2">
                    <div className="w-8 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-bold">
                      {currentUserName[0].toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            )) : <p className="text-gray-500">No messages yet</p>}
        </main>

        {selectedUser && <FooterInput onSend={handleSendMessage} />}
      </div>
    </div>
  );
};

function FooterInput({ onSend }: { onSend: (content: string) => void }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <footer className="p-4 border-t border-gray-300">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input type="text" placeholder="Type your message..." className="flex-1 p-2 border border-gray-300 rounded focus:outline-none" value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Send</button>
      </form>
    </footer>
  );
}
