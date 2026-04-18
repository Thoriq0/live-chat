"use client";
import { useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 3000;

export default function MainChatPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [myId, setMyId] = useState(null);
  const [myUsername, setMyUsername] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [pageError, setPageError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [sendError, setSendError] = useState("");

  // get user & list user
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
        setSelectedUser((currentSelectedUser) => {
          if (currentSelectedUser) {
            return allUsers.find((u) => u.id === currentSelectedUser.id) || allUsers[0] || null;
          }

          return allUsers[0] || null;
        });
      } catch (error) {
        setPageError(error.message || "Terjadi kesalahan saat memuat halaman");
      } finally {
        setIsBootstrapping(false);
      }
    }

    fetchUsers();
  }, [router]);

  const loadHistory = useEffectEvent(async (userId) => {
    setHistoryError("");
    setIsHistoryLoading(true);

    try {
      const res = await fetch(`/api/messages?userId=${userId}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Gagal memuat riwayat chat");
      }

      const data = await res.json();
      const normalized = data.map((m) => ({
        type: "message",
        from: m.senderId,
        to: m.receiverId,
        content: m.content,
        createdAt: m.createdAt,
      }));

      setReceivedMessages(normalized);
    } catch (error) {
      setHistoryError(error.message || "Riwayat chat tidak bisa dimuat");
    } finally {
      setIsHistoryLoading(false);
    }
  });

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

  // Send Message
  const handleSend = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    setSendError("");

    if (!trimmedMessage || !selectedUser || isSending) return;

    setIsSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          to: selectedUser.id,
          content: trimmedMessage,
        }),
      });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSendError(data.error || "Gagal kirim pesan");
        return;
      }

      const createdMessage = await res.json();

      setReceivedMessages((prev) => [
        ...prev,
        {
          type: "message",
          from: createdMessage.senderId,
          to: createdMessage.receiverId,
          content: createdMessage.content,
          createdAt: createdMessage.createdAt,
        },
      ]);
      setMessage("");
    } catch {
      setSendError("Tidak bisa mengirim pesan sekarang");
    } finally {
      setIsSending(false);
    }
  };

  // chat history
  useEffect(() => {
    if (!selectedUser || !myId) return;
    loadHistory(selectedUser.id);

    const intervalId = window.setInterval(() => {
      loadHistory(selectedUser.id);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [selectedUser, myId]);

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-gray-900 px-4 py-10 text-gray-100">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-800 bg-gray-800/80 p-6 shadow-lg">
          <h1 className="text-xl font-semibold">Memuat chat...</h1>
          <p className="mt-2 text-sm text-gray-400">Tunggu sebentar, kita lagi ambil data akun dan percakapan kamu.</p>
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
    <div className="h-screen bg-gray-900 text-gray-100 flex flex-col sm:flex-row">
      {/* Sidebar */}
      <div
        className={`w-full sm:w-72 border-b sm:border-r border-gray-700 p-4 space-y-2 overflow-y-auto ${
          sidebarOpen ? "" : "hidden sm:block"
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Chats</h2>
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
          {historyError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {historyError}
            </div>
          ) : null}
          {!historyError && isHistoryLoading ? (
            <div className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300">
              Memuat riwayat chat...
            </div>
          ) : null}
          {!selectedUser ? (
            <div className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300">
              Belum ada lawan chat yang dipilih.
            </div>
          ) : null}
          {selectedUser && !isHistoryLoading && !historyError && receivedMessages.length === 0 ? (
            <div className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300">
              Belum ada pesan dengan {selectedUser.username}. Kirim pesan pertama buat mulai obrolan.
            </div>
          ) : null}
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
              placeholder="Ketik pesan..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={!selectedUser || isSending}
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
