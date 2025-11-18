"use client";
import { useState } from "react";

export default function LoginPage() {
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");

   const handleSubmit = async (e) => {
      e.preventDefault();

      const res = await fetch("/api/auth/login", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ username, password }),
         credentials: "include"
      });

      if (res.ok) {
         window.location.href = "/";
      } else {
         const data = await res.json();
         alert(data.error || "Login gagal");
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
         <div className="bg-gray-800 shadow-lg rounded-2xl p-6 w-full max-w-sm text-gray-100">
            <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
            <p>User Login Ada 2 (userF & userS) dengan password (password123)</p>
            <p>Lupa Buat Sign-out, Hapus Cookie Token aja</p>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                     type="text"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-700 text-gray-100"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-700 rounded-xl bg-gray-700 text-gray-100"
                  />
               </div>
               <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition"
               >
                  Sign In
               </button>
            </form>
         </div>
      </div>
   );
}
