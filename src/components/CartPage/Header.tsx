"use client";

import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  return (

    <div className="p-4 px-40 flex items-center shadow-xl bg-white">
      <h1 className="text-4xl font-bold text-black ml-4">Crave Buddy</h1>

      <button className="ml-auto bg-white text-black font-bold py-2 px-4 rounded-xl border-1 hover:cursor-pointer" onClick={() => router.push("/mood-board")}>
        Your Mood Board
      </button>
    
    </div>

  );

}