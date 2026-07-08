import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { pb } from "../lib/pocketbase";
import type { Booking } from "../lib/types";
import { StatusBadge } from "../components/ui/Badge";
import { BookingDetailModal } from "../components/bookings/BookingDetailModal";
import { formatRange, isPast } from "../utils/dateRange";

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const STATUS_BORDER: Record<string, string> = {
  pending: "border-l-amber-400",
  approved: "border-l-emerald-400",
  rejected: "border-l-red-400",
};

function statusBorder(b: Booking) {
  if (b.cancelled) return "border-l-neutral-300 dark:border-l-neutral-600";
  return STATUS_BORDER[b.status] ?? "border-l-neutral-300 dark:border-l-neutral-600";
}

export function MyCalendarPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const userId = user?.id;

  function load() {
    if (!userId) return;
    setLoading(true);
    return pb
      .collection("bookings")
      .getFullList<Booking>({
        filter: pb.filter("requested_by = {:id}", { id: userId }),
        sort: "start",
        expand: "room",
      })
      .then(setBookings)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const dayB = bookings.filter(
        (b) => new Date(b.start).toDateString() === d.toDateString(),
      );
      dayB.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      days.push({ date: d, bookings: dayB });
    }
    return days;
  }, [weekStart, bookings]);

  const weekTotal = useMemo(
    () => weekDays.reduce((sum, d) => sum + d.bookings.length, 0),
    [weekDays],
  );

  function prevWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }

  function nextWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }

  function goToday() {
    const now = new Date();
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    setWeekStart(d);
  }

  const today = new Date();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-royal-600 text-white shadow-sm shadow-royal-900/20">
          <CalendarDays size={20} />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Mi calendario
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Tus reservas de la semana. Toca cualquiera para ver el detalle completo.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            aria-label="Semana anterior"
            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextWeek}
            aria-label="Semana siguiente"
            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={goToday}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-royal-600 transition-colors hover:bg-royal-50 dark:text-royal-400 dark:hover:bg-royal-500/10"
          >
            Hoy
          </button>
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {weekTotal === 0
                ? "Sin reservas esta semana"
                : `${weekTotal} ${weekTotal === 1 ? "reserva" : "reservas"} esta semana`}
            </span>
          )}
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {weekDays[0]?.date.toLocaleDateString("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            &ndash;{" "}
            {weekDays[6]?.date.toLocaleDateString("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {weekDays.map(({ date, bookings: dayB }) => {
            const isToday = date.toDateString() === today.toDateString();
            return (
              <div
                key={date.toISOString()}
                className={`rounded-2xl border bg-white p-4 shadow-soft dark:bg-neutral-900 ${
                  isToday
                    ? "border-royal-300 dark:border-royal-600"
                    : "border-neutral-200 dark:border-neutral-800"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {DAY_LABELS[date.getDay()]}{" "}
                    {date.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                  </span>
                  {isToday && (
                    <span className="rounded-full bg-royal-100 px-2 py-0.5 text-[10px] font-medium text-royal-700 dark:bg-royal-500/20 dark:text-royal-300">
                      Hoy
                    </span>
                  )}
                </div>
                {dayB.length === 0 ? (
                  <p className="py-2 text-sm text-neutral-400 dark:text-neutral-500">
                    Sin reservas
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {dayB.map((b) => (
                      <li key={b.id}>
                        <button
                          type="button"
                          onClick={() => setSelected(b)}
                          className={`flex w-full items-center justify-between gap-3 rounded-lg border border-l-4 border-neutral-100 bg-white px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60 ${statusBorder(b)}`}
                        >
                          <div className="min-w-0">
                            <span className="block truncate font-medium text-neutral-800 dark:text-neutral-200">
                              {b.expand?.room?.name ?? "Sala"}
                            </span>
                            <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">
                              {formatRange(b.start, b.end)}
                              {b.reason ? ` · ${b.reason}` : ""}
                            </span>
                          </div>
                          <span className="shrink-0">
                            <StatusBadge
                              status={b.status}
                              past={isPast(b.end)}
                              cancelled={b.cancelled}
                              attended={b.attended}
                            />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && !userId && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
          <Inbox size={24} className="text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Debes iniciar sesión para ver tu calendario.
          </p>
        </div>
      )}

      {selected && (
        <BookingDetailModal
          booking={selected}
          canApprove={false}
          canDelete={selected.requested_by === user?.id}
          currentUser={user}
          onClose={() => setSelected(null)}
          onUpdated={(id, patch) => {
            setBookings((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));
            load();
          }}
          onDeleted={(id) => {
            setBookings((list) => list.filter((b) => b.id !== id));
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
