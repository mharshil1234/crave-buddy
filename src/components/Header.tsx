"use client";

import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  return (

    <div className="bg-[#ff5200] p-4 flex items-center">
      <h1 className="text-4xl font-bold text-white ml-4">Crave Buddy</h1>

      <button className="ml-auto bg-white text-[#ff5200] font-bold py-2 px-4 rounded-xl hover:cursor-pointer" onClick={() => router.push("/mood-board")}>
        Your Mood Board
      </button>
    
    </div>

  );

}