"use client";

import { signOut } from "@/lib/auth-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function signout() {
    const router = useRouter();

    useEffect(() => {
        signOut();
        router.push("/");    
    }, []);
}