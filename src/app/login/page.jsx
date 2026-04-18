"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
   const router = useRouter();
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [errorMessage, setErrorMessage] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isCheckingSession, setIsCheckingSession] = useState(true);

   useEffect(() => {
      let isMounted = true;

      async function checkSession() {
         try {
            const res = await fetch("/api/me", {
               credentials: "include",
               cache: "no-store",
            });

            if (res.ok) {
               router.replace("/");
               return;
            }
         } catch {
            // Ignore session check failure and allow manual login.
         } finally {
            if (isMounted) {
               setIsCheckingSession(false);
            }
         }
      }

      checkSession();

      return () => {
         isMounted = false;
      };
   }, [router]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setErrorMessage("");
      setIsSubmitting(true);

      try {
         const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            credentials: "include"
         });

         if (res.ok) {
            router.replace("/");
            router.refresh();
            return;
         }

         const data = await res.json().catch(() => ({}));
         setErrorMessage(data.error || "Login gagal");
      } catch {
         setErrorMessage("Tidak bisa terhubung ke server");
      } finally {
         setIsSubmitting(false);
      }
   };

   if (isCheckingSession) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 text-gray-100">
            <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-800/80 p-6 text-center shadow-lg">
               <h1 className="text-xl font-semibold">Memeriksa sesi...</h1>
               <p className="mt-2 text-sm text-gray-400">Tunggu sebentar, kita cek apakah kamu sudah login.</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
         <div className="bg-gray-800 shadow-lg rounded-2xl p-6 w-full max-w-sm text-gray-100">
            <div className="mb-6 flex items-center justify-center gap-2">
               <h1 className="text-2xl font-bold text-center">Login</h1>
               <div className="group relative">
                  <button
                     type="button"
                     className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-600 text-sm text-gray-200 transition hover:bg-gray-700"
                     aria-label="Lihat akun demo"
                  >
                     i
                  </button>
                  <div className="pointer-events-none absolute left-1/2 top-10 z-10 hidden w-64 -translate-x-1/2 rounded-xl border border-gray-700 bg-gray-900 p-3 text-left text-sm text-gray-200 shadow-xl group-hover:block group-focus-within:block">
                     <p className="font-semibold">Akun demo</p>
                     <p className="mt-2 text-gray-300">`thoriq` / `password123`</p>
                     <p className="text-gray-300">`ahmad` / `password123`</p>
                  </div>
               </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                     type="text"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     autoComplete="username"
                     className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-700 text-gray-100"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     autoComplete="current-password"
                     className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-700 text-gray-100"
                  />
               </div>
               {errorMessage ? (
                  <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                     {errorMessage}
                  </div>
               ) : null}
               <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition disabled:cursor-not-allowed disabled:opacity-60"
               >
                  {isSubmitting ? "Signing in..." : "Sign In"}
               </button>
            </form>
         </div>
      </div>
   );
}
