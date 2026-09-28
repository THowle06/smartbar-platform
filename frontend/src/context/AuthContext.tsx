"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface UserProfile {
  token: string;
  role: "STUDENT" | "RECEPTIONIST" | "TECHNICIAN" | "ADMIN";
  name: string;
  email: string;
  studentId?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loginAs: (role: "STUDENT" | "RECEPTIONIST" | "TECHNICIAN") => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("smartbar_auth");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("smartbar_auth");
      }
    }
    setIsLoading(false);
  }, []);

  const loginAs = async (role: "STUDENT" | "RECEPTIONIST" | "TECHNICIAN") => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/auth/mock-sso?role=${role}`,
        {
          method: "POST",
        },
      );
      if (!res.ok) throw new Error("Mock login failed");
      const data: UserProfile = await res.json();
      setUser(data);
      localStorage.setItem("smartbar_auth", JSON.stringify(data));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("smartbar_auth");
  };

  return (
    <AuthContext.Provider value={{ user, loginAs, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
