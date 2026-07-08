import { CheckCheck, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Booking } from "../../lib/types";
import { STATUS_LABELS } from "../../lib/types";

export function StatusBadge({
  status,
  past = false,
  cancelled,
  attended,
}: {
  status: Booking["status"];
  past?: boolean;
  cancelled?: boolean;
  attended?: boolean;
}) {
  if (cancelled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 ring-1 ring-inset ring-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700">
        <XCircle size={13} strokeWidth={2.5} />
        Cancelada
      </span>
    );
  }

  if (status === "approved" && past && !attended) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30">
        <XCircle size={13} strokeWidth={2.5} />
        Solicitó y no usó
      </span>
    );
  }

  if (status === "approved" && past && attended) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
        <CheckCheck size={13} strokeWidth={2.5} />
        Asistió
      </span>
    );
  }

  if (status === "approved" && past) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 ring-1 ring-inset ring-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700">
        <CheckCheck size={13} strokeWidth={2.5} />
        Finalizada
      </span>
    );
  }

  const config: Record<string, { className: string; icon: typeof Clock }> = {
    pending: {
      className:
        "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
      icon: Clock,
    },
    approved: {
      className:
        "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
      icon: CheckCircle2,
    },
    rejected: {
      className:
        "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
      icon: XCircle,
    },
  };

  const c = config[status];
  if (!c) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.className}`}
    >
      <c.icon size={13} strokeWidth={2.5} />
      {STATUS_LABELS[status]}
    </span>
  );
}
