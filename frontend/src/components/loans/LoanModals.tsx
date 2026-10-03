"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, QrCode } from "lucide-react";

interface LoanModalsProps {
  token: string;
  onSuccess: () => void;
  checkoutLoanId: string | null;
  onCloseCheckout: () => void;
  returnLoanId: string | null;
  onCloseReturn: () => void;
}

export function LoanModals({
  token,
  onSuccess,
  checkoutLoanId,
  onCloseCheckout,
  returnLoanId,
  onCloseReturn,
}: LoanModalsProps) {
  // Checkout State
  const [assetTag, setAssetTag] = useState("");
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Return State
  const [screenOk, setScreenOk] = useState(true);
  const [deviceTurnsOn, setDeviceTurnsOn] = useState(true);
  const [casingIntact, setCasingIntact] = useState(true);
  const [missingCharger, setMissingCharger] = useState(false);
  const [missingCase, setMissingCase] = useState(false);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState("");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutLoanId || !assetTag.trim()) return;

    setCheckoutSubmitting(true);
    setCheckoutError("");

    try {
      const res = await fetch(
        `http://localhost:8080/api/loans/${checkoutLoanId}/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ assetTag: assetTag.trim() }),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to checkout loan.");
      }

      setAssetTag("");
      onCloseCheckout();
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCheckoutError(err.message);
      } else {
        setCheckoutError("Failed to checkout loan.");
      }
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnLoanId) return;

    setReturnSubmitting(true);
    setReturnError("");

    const missingItems: string[] = [];
    if (missingCharger) missingItems.push("Charger");
    if (missingCase) missingItems.push("Case");

    try {
      const res = await fetch(
        `http://localhost:8080/api/loans/${returnLoanId}/return`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            screenOk,
            deviceTurnsOn,
            casingIntact,
            missingItems,
          }),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to return loan.");
      }

      onCloseReturn();
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setReturnError(err.message);
      } else {
        setReturnError("Failed to return loan.");
      }
    } finally {
      setReturnSubmitting(false);
    }
  };

  return (
    <>
      {/* 1. Barcode Checkout Modal */}
      {checkoutLoanId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-lg">Book Out Loan Device</h3>
              </div>
              <button
                onClick={onCloseCheckout}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Scan or Enter Device Asset Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. X13-083"
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Scan the physical barcode sticker on the back of the laptop or
                  enter the ID.
                </p>
              </div>

              {checkoutError && (
                <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={onCloseCheckout}
                  className="px-4 py-2 text-xs border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkoutSubmitting}
                  className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                >
                  {checkoutSubmitting ? "Booking Out..." : "Complete Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Device Return Checklist Modal */}
      {returnLoanId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-lg">Return Device Checklist</h3>
              </div>
              <button
                onClick={onCloseReturn}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReturn} className="space-y-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">
                    Is the screen intact?
                  </span>
                  <select
                    value={screenOk ? "yes" : "no"}
                    onChange={(e) => setScreenOk(e.target.value === "yes")}
                    className="border text-xs rounded p-1.5 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">
                    Does the device power on?
                  </span>
                  <select
                    value={deviceTurnsOn ? "yes" : "no"}
                    onChange={(e) => setDeviceTurnsOn(e.target.value === "yes")}
                    className="border text-xs rounded p-1.5 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">
                    Is the casing undamaged?
                  </span>
                  <select
                    value={casingIntact ? "yes" : "no"}
                    onChange={(e) => setCasingIntact(e.target.value === "yes")}
                    className="border text-xs rounded p-1.5 bg-slate-50 dark:bg-slate-600"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="pt-2 border-t text-xs">
                  <span className="font-medium text-slate-500 block mb-2">
                    Missing Accessories:
                  </span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={missingCharger}
                        onChange={(e) => setMissingCharger(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Charger</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={missingCase}
                        onChange={(e) => setMissingCase(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {returnError && (
                <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{returnError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={onCloseReturn}
                  className="px-4 py-2 text-xs border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnSubmitting}
                  className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
                >
                  {returnSubmitting ? "Processing..." : "Confirm Return & Wipe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
