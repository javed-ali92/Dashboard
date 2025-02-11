"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const loginEmail = process.env.NEXT_PUBLIC_EMAIL;
    const loginPassword = process.env.NEXT_PUBLIC_PASSWORD;

    if (email === loginEmail && password === loginPassword) {
      localStorage.setItem("isLoggedIn", "true");
      router.push("/admin/dashboard");
    } else {
      alert("Invalid email or password");
    }
    
  };


  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-2xl font-semibold mb-4 flex font-serif justify-center text-gray-800">Admin Login</h2>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
        />
        <button
          type="submit"
          className="bg-[#be942f] text-white px-4 py-2 rounded-lg w-full hover:bg-[#977526] transition"
        >
          Login
        </button>
      </form>
    </div>

  );
}