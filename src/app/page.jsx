"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function getWebSocketUrl() {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }

  return "wss://support-vercel-production.up.railway.app";
}

export default function MainChatPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [myId, setMyId] = useState(null);
  const [myUsername, setMyUsername] = useState("");
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [pageError, setPageError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const socketUrl = useMemo(() => getWebSocketUrl(), []);

  useEffect(() => {
    async function fetchUsers() {
      setPageError("");
      setIsBootstrapping(true);

      try {
        const meRes = await fetch("/api/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (meRes.status === 401) {
          router.replace("/login");
          return;
        }

        if (!meRes.ok) {
          throw new Error("Gagal mengambil data user");
        }

        const me = await meRes.json();
        setMyId(me.id);
        setMyUsername(me.username);

        const usersRes = await fetch("/api/users", {
          credentials: "include",
          cache: "no-store",
        });

        if (usersRes.status === 401) {
          router.replace("/login");
          return;
        }

        if (!usersRes.ok) {
          throw new Error("Gagal mengambil daftar user");
        }

        const allUsers = await usersRes.json();
        setUsers(allUsers);
      } catch (error) {
        setPageError(error.message || "Terjadi kesalahan saat memuat halaman");
      } finally {
        setIsBootstrapping(false);
      }
    }

    fetchUsers();
  }, [router]);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!myId || !myUsername) return;

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;
    setSocketStatus("connecting");

    socket.addEventListener("open", () => {
      setSocketStatus("open");
    });

    socket.addEventListener("message", (event) => {
      try {
        const receivedData = JSON.parse(event.data);
        if (receivedData?.type === "message" && receivedData.content) {
          setReceivedMessages((prev) => [...prev, receivedData]);
        }
      } catch (e) {
        console.error("Invalid message format", e);
        console.log("Raw message:", event.data);
      }
    });

    socket.addEventListener("error", () => {
      setSocketStatus("error");
    });

    socket.addEventListener("close", () => {
      setSocketStatus("closed");
    });

    return () => {
      socket.close();
    };
  }, [myId, myUsername, socketUrl]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    setSendError("");

    if (!trimmedMessage) return;

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setSendError("Koneksi WebSocket belum siap");
      return;
    }

    setIsSending(true);

    const data = {
      type: "message",
      from: myId,
      username: myUsername,
      content: trimmedMessage
    };

    socketRef.current.send(JSON.stringify(data));
    setMessage("");
    setIsSending(false);
  };

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-gray-900 px-4 py-10 text-gray-100">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-800 bg-gray-800/80 p-6 shadow-lg">
          <h1 className="text-xl font-semibold">Memuat room...</h1>
          <p className="mt-2 text-sm text-gray-400">Tunggu sebentar, kita lagi ambil data akun kamu.</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-gray-900 px-4 py-10 text-gray-100">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 p-6 shadow-lg">
          <h1 className="text-xl font-semibold text-red-100">Halaman gagal dimuat</h1>
          <p className="mt-2 text-sm text-red-200/90">{pageError}</p>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col sm:flex-row">
      {/* Sidebar */}
      <div
        className={`w-full sm:w-72 border-b sm:border-r border-gray-700 p-4 space-y-2 overflow-y-auto ${
          sidebarOpen ? '' : 'hidden sm:block'
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Room Members</h2>
            <p className="text-sm text-gray-400">{myUsername || "Loading user..."}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-200 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
        {users.map((u) => (
          <div
            key={u.id}
            className={`p-3 rounded-xl transition ${
              myId === u.id ? "bg-blue-600/20 border border-blue-500/30" : "hover:bg-gray-800"
            }`}
          >
            <div className="font-medium">{u.username}</div>
            <div className="text-xs text-gray-400">{myId === u.id ? "You" : "Member"}</div>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex flex-col flex-1 relative">
        {/* Mobile Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="sm:hidden absolute top-2 left-4 bg-gray-800 p-2 rounded-lg border border-gray-700"
        >
          ☰
        </button>

        {/* Header */}
        <div className="border-b border-gray-700 p-4 text-lg font-semibold pl-16 sm:pl-10">
          Broadcast Room
          <p className="mt-1 text-sm font-normal text-gray-400">
            {socketStatus === "open" ? "Connected" : socketStatus === "connecting" ? "Connecting..." : "Connection lost"}
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          {receivedMessages.length === 0 ? (
            <div className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300">
              Belum ada pesan broadcast. Kirim pesan pertama buat mulai obrolan.
            </div>
          ) : null}
          {receivedMessages
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
                  <p className={`mb-1 text-xs ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                    {isMe ? "You" : msg.username || `User ${msg.from}`}
                  </p>
                  {msg.content}
                </div>
              );
            })}
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-gray-700"
        >
          {sendError ? (
            <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {sendError}
            </div>
          ) : null}
          <div className="flex items-center gap-3">
            <input
              className="flex-1 px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none"
              placeholder="Ketik pesan broadcast..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={!message.trim() || isSending || socketStatus !== "open"}
              className="p-3 rounded-full bg-blue-600 hover:bg-blue-500 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              ✈️
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
