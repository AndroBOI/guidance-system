"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  email: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/users/me", {
          credentials: "include", 
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data);
      } catch (err) {
        router.push("/login"); 
      }
    };

    fetchUser();
  }, [router]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <p>Your dashboard content goes here.</p>
    </div>
  );
}
