"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  IdCard,
} from "lucide-react";
import api from "@/lib/api";

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber: string;
  address: string;
  birthDate: string;
  gender: string;
  user: {
    email: string;
  };
}

interface NoProfileResponse {
  hasProfile: false;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get<Profile | NoProfileResponse>(
          "/profile/me",
        );
        console.log("Response:", response.data);
        if (
          "hasProfile" in response.data &&
          response.data.hasProfile === false
        ) {
          setProfile(null);
        } else if (
          "hasProfile" in response.data &&
          typeof response.data.hasProfile === "object"
        ) {
          setProfile(response.data.hasProfile as Profile);
        } else {
          setProfile(response.data as Profile);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <Card className="w-full max-w-md shadow-sm">
          <CardContent className="pt-6">
            <p className="text-destructive text-center text-sm">{error}</p>
            <Button
              onClick={() => router.push("/profile/dashboard")}
              className="w-full mt-4"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <Card className="w-full max-w-md shadow-sm">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground text-sm">
              No profile found
            </p>
            <Button
              onClick={() => router.push("/create/info")}
              className="w-full mt-4"
            >
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${profile.firstName} ${
    profile.middleName ? `${profile.middleName} ` : ""
  }${profile.lastName}`;

  const initials = `${profile.firstName?.[0] ?? ""}${
    profile.lastName?.[0] ?? ""
  }`.toUpperCase();

  const infoRows = [
    { label: "Full Name", value: fullName, icon: User },
    { label: "Email", value: profile.user?.email || user?.email, icon: Mail },
    { label: "Phone Number", value: profile.phoneNumber, icon: Phone },
    {
      label: "Age",
      value: `${calculateAge(profile.birthDate)} years old`,
      icon: Calendar,
    },
    {
      label: "Gender",
      value: profile.gender?.toLowerCase() || "-",
      icon: Users,
      capitalize: true,
    },
    { label: "Address", value: profile.address, icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
            <IdCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              My Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Your personal information on file
            </p>
          </div>
        </div>

        {/* Identity summary */}
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent">
              <span className="text-lg font-semibold text-primary">
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{fullName}</p>
              <p className="truncate text-sm text-muted-foreground">
                {profile.user?.email || user?.email}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Personal information table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Details associated with your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {infoRows.map((row, idx) => (
              <div key={row.label}>
                <div className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <row.icon className="h-4 w-4 shrink-0" />
                    <span className="text-sm">{row.label}</span>
                  </div>
                  <span
                    className={`text-sm font-medium text-right ${
                      row.capitalize ? "capitalize" : ""
                    }`}
                  >
                    {row.value || "-"}
                  </span>
                </div>
                {idx < infoRows.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
