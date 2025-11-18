"use client";
import { useEffect, useState, useRef } from "react";

export default function MainChatPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [myId, setMyId] = useState(null);

  // get user & list user
  useEffect(() => {
    async function fetchUsers() {
      const [usersRes, meRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/me", { credentials: "include" }),
      ]);

      const [allUsers, me] = await Promise.all([
        usersRes.json(),
        meRes.json(),
      ]);

      setMyId(me.id);

      const otherUsers = allUsers.filter((u) => u.id !== me.id);
      setUsers(otherUsers);

      if (otherUsers.length > 0) setSelectedUser(otherUsers[0]);
    }

    fetchUsers();
  }, []);

  // WS Connection
  const socketRef = useRef(null);

  useEffect(() => {
  if (!myId) return;

  const socket = new WebSocket("ws://localhost:8080");
  socketRef.current = socket;

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "auth", userId: myId }));
  });

  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "auth_ok") {
        console.log("WS authenticated as:", data.userId);
        return;
      }

      if (data.type === "auth_error") {
        console.error("WS: auth error");
        return;
      }

      if (data.type === "message") {
        setReceivedMessages(prev => [...prev, data]); // realtime append
      }
    } catch (e) {
      console.error("Invalid WS message:", event.data);
    }
  });

  return () => socket.close();
}, [myId]);


  // Send Message
  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    const data = {
      type: "message",
      from: myId,
      to: selectedUser.id,
      content: message,
    };

    socketRef.current?.send(JSON.stringify(data));
    setMessage("");
  };

  // chat history
  useEffect(() => {
    if (!selectedUser || !myId) return;

    async function loadHistory() {
      const res = await fetch(
        `/api/messages?userA=${myId}&userB=${selectedUser.id}`
      );

      const data = await res.json();

      // Normalisasi
      const normalized = data.map(m => ({
        type: "message",
        from: m.senderId,
        to: m.receiverId,
        content: m.content,
        createdAt: m.createdAt
      }));

      setReceivedMessages(normalized);
    }

    loadHistory();
  }, [selectedUser, myId]);


  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex flex-col sm:flex-row">
      {/* Sidebar */}
      <div
        className={`w-full sm:w-72 border-b sm:border-r border-gray-700 p-4 space-y-2 overflow-y-auto ${
          sidebarOpen ? "" : "hidden sm:block"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        {users.map((u) => (
          <div
            key={u.id}
            className={`p-3 rounded-xl cursor-pointer transition ${
              selectedUser?.id === u.id ? "bg-gray-700" : "hover:bg-gray-800"
            }`}
            onClick={() => setSelectedUser(u)}
          >
            {u.username}
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex flex-col flex-1 relative min-h-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="sm:hidden absolute top-2 left-4 bg-gray-800 p-2 rounded-lg border border-gray-700"
        >
          ☰
        </button>

        <div className="border-b border-gray-700 p-4 text-lg font-semibold pl-16 sm:pl-10">
          {selectedUser ? selectedUser.username : "Start Chat"}
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 min-h-0">
          {receivedMessages
            .filter(
              (msg) =>
                (msg.from === selectedUser?.id && msg.to === myId) ||
                (msg.from === myId && msg.to === selectedUser?.id)
            )
            .map((msg, i) => {
              const isMe = msg.from === myId;

              return (
                <div
                  key={i}
                  className={`max-w-[70%] px-4 py-2 rounded-2xl wrap-break-words ${
                    isMe
                      ? "self-end bg-blue-600 text-white rounded-br-none"
                      : "self-start bg-gray-700 text-gray-100 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              );
            })}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-gray-700 flex items-center gap-3"
        >
          <input
            className="flex-1 px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none"
            placeholder="Ketik pesan..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="p-3 rounded-full bg-blue-600 hover:bg-blue-500 transition"
          >
            ✈️
          </button>
        </form>
      </div>
    </div>
  );
}
