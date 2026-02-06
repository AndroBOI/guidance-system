"use client";

import { ReactNode } from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
interface LayoutProps {
  children: ReactNode;
}

interface User {
  email: string;
}

export default function RootLayout({ children }: LayoutProps) {
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

  if (!user)
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  return (
   <div className="h-screen flex flex-col bg-background overflow-hidden">
      <nav className="w-full bg-primary p-4 text-white">
        <span>Navbar hehe - {user.email}</span>
      </nav>

      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
