import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { pb } from "../lib/pocketbase";
import { useRooms } from "../hooks/useRooms";
import { canApproveRequests, canManageRequests } from "../lib/types";
import type { Booking } from "../lib/types";
import { BookingDetailModal } from "../components/bookings/BookingDetailModal";

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);
const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie"];

function toMinutes(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

function startOfWeek(): Date {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function RoomTimelinePage() {
  const { user } = useAuth();
  const { rooms } = useRooms();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(startOfWeek);
  const [selected, setSelected] = useState<Booking | null>(null);

  const manage = user ? canManageRequests(user.role) : false;
  const canApprove = user ? canApproveRequests(user.role) : false;

  function load() {
    setLoading(true);
    return pb
      .collection("bookings")
      .getFullList<Booking>({
        filter: "status = 'approved' && cancelled = false",
        sort: "start",
        expand: "room",
      })
      .then(setBookings)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const weekDays = useMemo(() => {
    return DAY_LABELS.map((label, idx) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + idx);
      const dayB = bookings.filter((b) => new Date(b.start).toDateString() === date.toDateString());
      return { label, date, bookings: dayB };
    });
  }, [weekStart, bookings]);

  const today = new Date();
  const totalMins = HOURS.length * 60;

  function nowLeftPct(): number | null {
    const mins = toMinutes(today) - HOURS[0] * 60;
    if (mins < 0 || mins > totalMins) return null;
    return (mins / totalMins) * 100;
  }

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
    setWeekStart(startOfWeek());
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-royal-600 text-white shadow-sm shadow-royal-900/20">
          <CalendarDays size={20} />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Timeline de salas
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Vista semanal de reservas aprobadas: qué sala está ocupada, cuándo y por quién.
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
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-royal-600 dark:bg-royal-500" />
            Reserva aprobada
          </span>
          <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="inline-block h-2.5 w-0.5 bg-red-500" />
            Ahora
          </span>
        </div>
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {weekStart.toLocaleDateString("es-MX", { day: "numeric", month: "long" })}
          &ndash;
          {(() => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + 4);
            return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
          })()}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(rooms.length || 3)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {weekDays.map(({ label, date, bookings: dayBookings }) => {
            const isToday = date.toDateString() === today.toDateString();
            const roomRows = rooms.map((room) => ({
              room,
              bookings: dayBookings.filter((b) => b.room === room.id),
            }));
            const hasAny = roomRows.some((r) => r.bookings.length > 0);
            const nowPct = isToday ? nowLeftPct() : null;

            return (
              <div key={date.toISOString()}>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {label} {date.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                  {isToday && (
                    <span className="rounded-full bg-royal-100 px-2 py-0.5 text-[10px] font-medium text-royal-700 dark:bg-royal-500/20 dark:text-royal-300">
                      Hoy
                    </span>
                  )}
                </h3>
                {!hasAny ? (
                  <p className="py-2 text-sm text-neutral-400 dark:text-neutral-500">
                    Sin reservas este día.
                  </p>
                ) : (
                  <div
                    className={`overflow-x-auto rounded-2xl border bg-white p-3 shadow-soft dark:bg-neutral-900 ${
                      isToday
                        ? "border-royal-300 dark:border-royal-600"
                        : "border-neutral-200 dark:border-neutral-800"
                    }`}
                  >
                    <div className="min-w-[680px]">
                      <div className="mb-1 flex border-b border-neutral-100 pb-1.5 dark:border-neutral-800">
                        <div className="w-28 shrink-0 sm:w-32" />
                        <div className="flex flex-1">
                          {HOURS.map((h) => (
                            <div
                              key={h}
                              className="flex-1 text-center text-[11px] font-medium text-neutral-400 dark:text-neutral-500"
                            >
                              {String(h).padStart(2, "0")}:00
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {roomRows.map(({ room, bookings: roomB }) => {
                          if (roomB.length === 0) return null;
                          return (
                            <div key={room.id} className="flex items-center py-1">
                              <div className="w-28 shrink-0 pr-2 sm:w-32" title={room.name}>
                                <p className="truncate text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                  {room.name}
                                </p>
                                {room.location && (
                                  <p className="truncate text-[10px] text-neutral-400 dark:text-neutral-500">
                                    {room.location}
                                  </p>
                                )}
                              </div>
                              <div className="relative flex-1" style={{ height: 30 }}>
                                <div className="absolute inset-0 flex">
                                  {HOURS.map((h) => (
                                    <div
                                      key={h}
                                      className="flex-1 border-l border-dashed border-neutral-200 dark:border-neutral-800"
                                    />
                                  ))}
                                </div>
                                {nowPct !== null && (
                                  <div
                                    className="pointer-events-none absolute top-0 bottom-0 z-20 w-0.5 bg-red-500"
                                    style={{ left: `${nowPct}%` }}
                                  />
                                )}
                                {roomB.map((b) => {
                                  const start = new Date(b.start);
                                  const end = new Date(b.end);
                                  const startMins = toMinutes(start) - HOURS[0] * 60;
                                  const endMins = toMinutes(end) - HOURS[0] * 60;
                                  const left = (startMins / totalMins) * 100;
                                  const width = ((endMins - startMins) / totalMins) * 100;

                                  return (
                                    <button
                                      key={b.id}
                                      type="button"
                                      onClick={() => setSelected(b)}
                                      title={`${b.requester_name || b.requester_email} · ${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}–${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`}
                                      className="absolute top-0.5 z-10 flex h-6 items-center overflow-hidden rounded-md bg-royal-600 px-1.5 text-left text-[10px] font-medium text-white shadow-sm transition-colors hover:bg-royal-700 dark:bg-royal-500 dark:hover:bg-royal-400"
                                      style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }}
                                    >
                                      <span className="truncate">
                                        {b.requester_name?.split(" ")[0] ?? b.requester_email}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <BookingDetailModal
          booking={selected}
          canApprove={canApprove}
          canDelete={manage || selected.requested_by === user?.id}
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
