import Link from "next/link";
import { Laptop, Calendar, Wrench } from "lucide-react";

export default function HomePage() {
  return (
    <div className="py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Smart Bar Service Platform
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Unified laptop loan distribution, hardware repair queue tracking, and
          customer service operations.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 pt-6">
        <Link
          href="/portal"
          className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-lg transition space-y-3"
        >
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-lg w-fit">
            <Laptop className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold">Student Self-Service</h2>
          <p className="text-sm text-slate-500">
            Request laptop loans, pre-fill repair issue details, accept quotes,
            and track progress.
          </p>
        </Link>

        <Link
          href="/desk"
          className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-lg transition space-y-3"
        >
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-lg w-fit">
            <Calendar className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold">Front Desk Calendar</h2>
          <p className="text-sm text-slate-500">
            View daily scheduled slots, scan loan barcodes, inspect return
            condition, and manage collections.
          </p>
        </Link>

        <Link
          href="/workshop"
          className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-lg transition spave-y-3"
        >
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-lg w-fit">
            <Wrench className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold">Technician Workshop</h2>
          <p className="text-sm text-slate-500">
            Hardware diagnostics, quote generation, locker assignment, and
            completion workflows.
          </p>
        </Link>
      </div>
    </div>
  );
}
