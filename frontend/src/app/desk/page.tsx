"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar as CalendarIcon,
  Clock,
  Laptop,
  User,
  AlertCircle,
  ChevronRight,
  Lock,
  Unlock,
} from "lucide-react";
import { LoanModals } from "@/components/loans/LoanModals";

interface Appointment {
  id: string;
  bookingId: string;
  studentName: string;
  studentId: string;
  type: "DROP_REPAIR" | "COLLECT_REPAIR" | "LOAN_COLLECTION";
  status: string;
  time: string;
  deviceSummary: string;
  storageLocation: string;
  canCollect: boolean;
}

export default function DeskPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [checkoutLoanId, setCheckoutLoanId] = useState<string | null>(null);
  const [returnLoanId, setReturnLoanId] = useState<string | null>(null);

  const token = user?.token;

  const fetchAppointments = useCallback(
    async (dateStr: string) => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8080/api/desk/appointments?date=${dateStr}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (err) {
        console.error("Failed to load appointments", err);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    let isMounted = true;

    if (!token) return;

    fetch(`http://localhost:8080/api/desk/appointments?date=${selectedDate}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load appointments");
        return res.json();
      })
      .then((data: Appointment[]) => {
        if (isMounted) {
          setAppointments(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load appointments", err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, token]);

  useEffect(() => {
    let isMounted = true;

    if (!user?.token) return;

    fetch(`http://localhost:8080/api/desk/appointments?date=${selectedDate}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load appointments");
        return res.json();
      })
      .then((data: Appointment[]) => {
        if (isMounted) {
          setAppointments(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load appointments", err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, user?.token]);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "DROP_REPAIR":
        return "border-l-4 border-amber-500 bg-amber-50/40 dark:bg-amber-950/20";
      case "COLLECT_REPAIR":
        return "border-l-4 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20";
      case "LOAN_COLLECTION":
        return "border-l-4 border-blue-500 bg-blue-50/40 dark:bg-blue-950/20";
      default:
        return "border-l-4 border-slate-300";
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "DROP_REPAIR":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200";
      case "COLLECT_REPAIR":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200";
      case "LOAN_COLLECTION":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (
    !user ||
    (user.role !== "RECEPTIONIST" &&
      user.role !== "TECHNICIAN" &&
      user.role !== "ADMIN")
  ) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border rounded-xl space-y-3">
        <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold">Front Desk Access Required</h2>
        <p className="text-sm text-slate-500">
          Please click <strong>Receptionist</strong> or{" "}
          <strong>Technician</strong> in the top-right header to switch roles
          and access the daily schedule.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold">Daily Appointments Roster</h1>
          <p className="text-sm text-slate-500">
            View scheduled laptop collections, repair intakes, and handovers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-slate-50 dark:bg-slate-800">
            <CalendarIcon className="h-4 w-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => fetchAppointments(selectedDate)}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Appointment Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          Loading scheduled slots...
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border rounded-xl space-y-2">
          <p className="text-slate-500 font-medium">
            No appointments scheduled for this date.
          </p>
          <span className="text-xs text-slate-400">
            Select another date from the picker above.
          </span>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              onClick={() => setSelectedAppointment(appt)}
              className={`p-5 rounded-xl border bg-white dark:bg-slate-900 cursor-pointer hover:shadow-md transition space-y-3 ${getTypeStyle(
                appt.type,
              )}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getBadgeStyle(
                    appt.type,
                  )}`}
                >
                  {appt.type.replace("_", " ")}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(appt.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                  <User className="h-4 w-4 text-slate-400" />
                  <span>{appt.studentName}</span>
                </div>
                <div className="text-xs text-slate-500 ml-5 font-mono">
                  ID: {appt.studentId || "N/A"} • Ref: {appt.bookingId}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Laptop className="h-3.5 w-3.5 text-slate-400" />
                  <span>{appt.deviceSummary}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Location:</span>
                  {appt.canCollect ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Unlock className="h-3 w-3" /> {appt.storageLocation}
                    </span>
                  ) : (
                    <span className="font-semibold text-rose-500 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Locked (Unpaid)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end text-xs text-blue-600 font-medium pt-1">
                <span>View Details</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over details modal preview */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold">
                  Booking #{selectedAppointment.bookingId}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedAppointment.type.replace("_", " ")}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg space-y-1">
                <p className="font-semibold">
                  {selectedAppointment.studentName}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Student ID: {selectedAppointment.studentId}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 border rounded">
                  <span className="text-slate-400 block">Status:</span>
                  <span className="font-bold">
                    {selectedAppointment.status}
                  </span>
                </div>
                <div className="p-2 border rounded">
                  <span className="text-slate-400 block">Storage:</span>
                  <span
                    className={`font-bold ${
                      selectedAppointment.canCollect
                        ? "text-emerald-600"
                        : "text-rose-500"
                    }`}
                  >
                    {selectedAppointment.storageLocation}
                  </span>
                </div>
              </div>

              <div className="p-3 border rounded-lg text-xs space-y-1">
                <span className="text-slate-400 block">Equipment:</span>
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  {selectedAppointment.deviceSummary}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              {selectedAppointment.type === "LOAN_COLLECTION" && (
                <button
                  onClick={() => {
                    setCheckoutLoanId(selectedAppointment.id);
                    setSelectedAppointment(null);
                  }}
                  className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Book Out Device
                </button>
              )}

              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 text-xs border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <LoanModals
        token={token || ""}
        onSuccess={() => fetchAppointments(selectedDate)}
        checkoutLoanId={checkoutLoanId}
        onCloseCheckout={() => setCheckoutLoanId(null)}
        returnLoanId={returnLoanId}
        onCloseReturn={() => setReturnLoanId(null)}
      />
    </div>
  );
}
