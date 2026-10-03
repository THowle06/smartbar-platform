"use client";

import React, { useState } from "react";
import { Wrench, Printer, AlertCircle, CheckCircle2 } from "lucide-react";

interface RepairIntakeModalProps {
  token: string;
  bookingId: string;
  repairId: string;
  studentName: string;
  studentId: string;
  deviceSummary: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function RepairIntakeModal({
  token,
  bookingId,
  repairId,
  studentName,
  studentId,
  deviceSummary,
  onClose,
  onSuccess,
}: RepairIntakeModalProps) {
  const [psuSn, setPsuSn] = useState("");
  const [visualInspection, setVisualInspection] = useState(
    "No visible external damage",
  );
  const [faultNotes, setFaultNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  const executeIntake = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();

    if (!token) {
      setError(
        "No authentication token detected. Please select Receptionist in the header.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `http://localhost:8080/api/desk/repairs/${repairId}/intake`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            psuSn: psuSn.trim() || "NO_PSU_PROVIDED",
            visualInspection: visualInspection.trim(),
            faultDescription: faultNotes.trim(),
            version: 0,
          }),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Backend returned status ${res.status}`);
      }

      setCompleted(true);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error during intake.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-lg">Intake Device: #{bookingId}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>

        {!completed ? (
          <form onSubmit={executeIntake} className="space-y-4 text-sm">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-xs space-y-1">
              <p>
                <strong>Student:</strong> {studentName} ({studentId})
              </p>
              <p>
                <strong>Device:</strong> {deviceSummary}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                PSU / Charger Serial Number
              </label>
              <input
                type="text"
                placeholder="Scan or enter charger S/N (leave blank if none)"
                value={psuSn}
                onChange={(e) => setPsuSn(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Visual Inspection Notes
              </label>
              <input
                type="text"
                required
                value={visualInspection}
                onChange={(e) => setVisualInspection(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Additional Fault Details
              </label>
              <textarea
                rows={2}
                placeholder="Specific symptoms reported by student at desk..."
                value={faultNotes}
                onChange={(e) => setFaultNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeIntake()}
                disabled={loading}
                className="px-4 py-2 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition"
              >
                {loading ? "Registering..." : "Confirm Intake & Arrived"}
              </button>
            </div>
          </form>
        ) : (
          /* Printable Label View */
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
              <CheckCircle2 className="h-5 w-5" />
              <span>Intake successfully logged! Device is marked ARRIVED.</span>
            </div>

            {/* Printable sticker template */}
            <div
              id="printable-bag-label"
              className="border-2 border-dashed border-slate-400 p-4 rounded-lg bg-white text-slate-900 font-mono text-xs space-y-2"
            >
              <div className="border-b pb-1 flex justify-between items-center font-bold">
                <span>SMART BAR REPAIR BAG LABEL</span>
                <span>#{bookingId}</span>
              </div>
              <div>
                <strong>STUDENT:</strong> {studentName} ({studentId})
              </div>
              <div>
                <strong>DEVICE:</strong> {deviceSummary}
              </div>
              <div>
                <strong>CHARGER/PSU:</strong> {psuSn || "NONE"}
              </div>
              <div>
                <strong>INSPECTION:</strong> {visualInspection}
              </div>
              <div className="pt-2 text-center text-lg tracking-widest font-bold">
                * {bookingId} *
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg flex items-center gap-1.5 transition"
              >
                <Printer className="h-4 w-4" /> Print Bag Sticker
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs border rounded-lg hover:bg-slate-50 transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
