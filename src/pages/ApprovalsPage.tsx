import { useMemo, useState } from "react";
import { CheckCheck, Inbox, XCircle } from "lucide-react";
import { useBookings } from "../hooks/useBookings";
import { pb } from "../lib/pocketbase";
import { EXTRA_ITEMS } from "../lib/types";
import type { Booking } from "../lib/types";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { TextArea } from "../components/ui/Field";
import { StatusBadge } from "../components/ui/Badge";
import { EXTRA_ICONS } from "../components/bookings/extraIcons";
import { formatRange } from "../utils/dateRange";

export function ApprovalsPage() {
  const { bookings, patchLocal } = useBookings("all");

  const pending = useMemo(
    () =>
      bookings
        .filter((b) => b.status === "pending")
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [bookings],
  );

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [extrasState, setExtrasState] = useState<Record<string, Record<string, boolean>>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  function getExtrasApproval(booking: Booking) {
    const key = booking.id;
    if (extrasState[key]) return extrasState[key];
    const initial: Record<string, boolean> = {};
    EXTRA_ITEMS.filter((item) => booking[item.key]).forEach((item) => {
      initial[item.approvedKey] = true;
    });
    return initial;
  }

  function extrasPayload(booking: Booking) {
    const approval = getExtrasApproval(booking);
    const payload: Record<string, boolean | string> = {};
    EXTRA_ITEMS.filter((item) => booking[item.key]).forEach((item) => {
      payload[item.approvedKey] = approval[item.approvedKey];
    });
    payload.extras_comment = comments[booking.id]?.trim() ?? "";
    return payload;
  }

  async function approve(booking: Booking) {
    setError(null);
    setActionLoading(booking.id);
    try {
      const payload = {
        status: "approved" as const,
        rejection_reason: "",
        ...extrasPayload(booking),
      };
      await pb.collection("bookings").update(booking.id, payload);
      patchLocal(booking.id, payload);
    } catch {
      setError("No se pudo aprobar: el horario se traslapa con otra reserva aprobada.");
    } finally {
      setActionLoading(null);
    }
  }

  async function reject(booking: Booking) {
    if (!reason.trim()) {
      setError("Debes indicar una raz\u00f3n de rechazo.");
      return;
    }
    setError(null);
    setActionLoading(booking.id);
    try {
      const payload = {
        status: "rejected" as const,
        rejection_reason: reason.trim(),
        ...extrasPayload(booking),
      };
      await pb.collection("bookings").update(booking.id, payload);
      patchLocal(booking.id, payload);
      setRejectingId(null);
      setReason("");
    } catch {
      setError("No se pudo rechazar la solicitud.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-royal-600 text-white shadow-sm shadow-royal-900/20">
          <CheckCheck size={20} />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Aprobaciones pendientes
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Revisa y resuelve las solicitudes que esperan tu decisi&oacute;n.
          </p>
        </div>
      </div>

      <Alert variant="error" className="mb-4" message={error} onDismiss={() => setError(null)} />

      {pending.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
          <Inbox size={28} className="text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No hay solicitudes pendientes por aprobar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((b) => {
            const requestedExtras = EXTRA_ITEMS.filter((item) => b[item.key]);
            const approval = getExtrasApproval(b);
            const name = b.requester_name || b.expand?.requested_by?.name || b.requester_email;

            return (
              <div
                key={b.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft dark:border-neutral-800 dark:bg-neutral-900 sm:p-5"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {b.expand?.room?.name ?? "Sala"}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {formatRange(b.start, b.end)}
                    </p>
                  </div>
                  <StatusBadge status="pending" />
                </div>

                <div className="mb-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      Solicitante
                    </span>
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">{name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      Personas
                    </span>
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">
                      {b.people_count}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">Motivo</span>
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">
                      {b.reason || "\u2014"}
                    </p>
                  </div>
                </div>

                {requestedExtras.length > 0 && (
                  <div className="mb-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                    <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Extras solicitados
                    </p>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {requestedExtras.map((item) => {
                        const Icon = EXTRA_ICONS[item.key];
                        const approved = approval[item.approvedKey];
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() =>
                              setExtrasState((prev) => ({
                                ...prev,
                                [b.id]: { ...prev[b.id], [item.approvedKey]: !approved },
                              }))
                            }
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                              approved
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                            }`}
                          >
                            <Icon size={12} /> {item.label}{" "}
                            {approved ? "\u2713" : "\u2717"}
                          </button>
                        );
                      })}
                    </div>
                    <TextArea
                      label="Comentario sobre extras (opcional)"
                      value={comments[b.id] ?? ""}
                      onChange={(e) =>
                        setComments((prev) => ({ ...prev, [b.id]: e.target.value }))
                      }
                      placeholder="Ej. no hay caf\u00e9 disponible"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                  {rejectingId === b.id ? (
                    <div className="w-full space-y-3">
                      <TextArea
                        label="Raz\u00f3n de rechazo"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => reject(b)}
                          loading={actionLoading === b.id}
                        >
                          <XCircle size={14} /> Confirmar rechazo
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRejectingId(null);
                            setReason("");
                          }}
                          disabled={actionLoading === b.id}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => approve(b)}
                        loading={actionLoading === b.id}
                      >
                        <CheckCheck size={14} /> Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setRejectingId(b.id)}
                        disabled={actionLoading === b.id}
                      >
                        <XCircle size={14} /> Rechazar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}