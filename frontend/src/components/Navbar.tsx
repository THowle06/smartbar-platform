"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Laptop, Calendar, Wrench, Shield, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, loginAs, logout } = useAuth();

  return (
    <header className="border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center space-x-2 font-bold text-lg text-blue-600"
        >
          <Laptop className="h-6 w-6" />
          <span>SmartBar OS</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-4 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            href="/portal"
            className="hover:text-blue-600 transition flex items-center gap-1.5"
          >
            <Laptop className="h-4 w-4" /> Student Portal
          </Link>
          <Link
            href="/desk"
            className="hover:text-blue-600 transition flex items-center gap-1.5"
          >
            <Calendar className="h-4 w-4" /> Front Desk
          </Link>
          <Link
            href="/workshop"
            className="hover:text-blue-600 transition flex items-center gap-1.5"
          >
            <Wrench className="h-4 w-4" /> Workshop
          </Link>
        </nav>
      </div>

      <div className="flex items-center space-x-3 text-sm">
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="flex flex-col text-right">
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {user.name}
              </span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full inline-block">
                {user.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-red-600 rounded-md transition"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 mr-1 flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" /> Mock SSO:
            </span>
            <button
              onClick={() => loginAs("STUDENT")}
              className="px-2.5 py-1 text-xs border rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Student
            </button>
            <button
              onClick={() => loginAs("RECEPTIONIST")}
              className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Receptionist
            </button>
            <button
              onClick={() => loginAs("TECHNICIAN")}
              className="px-2.5 py-1 text-xs border rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Technician
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
