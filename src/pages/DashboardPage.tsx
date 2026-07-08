import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  ChartColumnIncreasing,
  Clock,
  FileText,
  Inbox,
  ListTodo,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBookings } from "../hooks/useBookings";
import { useRooms } from "../hooks/useRooms";
import { canApproveRequests, canManageRequests } from "../lib/types";
import { StatusBadge } from "../components/ui/Badge";
import { formatDateTime } from "../utils/dateRange";

export function DashboardPage() {
  const { user } = useAuth();
  const { bookings, loading } = useBookings("all");
  const { rooms } = useRooms();

  const now = new Date();

  const todayBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          new Date(b.start).toDateString() === now.toDateString() && b.status === "approved" && !b.cancelled,
      ),
    [bookings, now],
  );

  const pending = useMemo(() => bookings.filter((b) => b.status === "pending"), [bookings]);

  const upcoming = useMemo(() => {
    const futureApproved = bookings.filter(
      (b) => b.status === "approved" && !b.cancelled && new Date(b.start) > now,
    );
    futureApproved.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    return futureApproved.slice(0, 5);
  }, [bookings, now]);

  const weekOccupancy = useMemo(() => {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekBookings = bookings.filter((b) => {
      const d = new Date(b.start);
      return b.status === "approved" && !b.cancelled && d >= weekStart && d < weekEnd;
    });

    const dayNames = ["Dom", "Lun", "Mar", "Mi\u00e9", "Jue", "Vie", "S\u00e1b"];
    return dayNames.map((label, i) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(dayDate.getDate() + i);
      const dayB = weekBookings.filter(
        (b) => new Date(b.start).toDateString() === dayDate.toDateString(),
      );
      const totalHours = dayB.reduce(
        (sum, b) => sum + (new Date(b.end).getTime() - new Date(b.start).getTime()) / 3600000,
        0,
      );
      return { label, hours: totalHours };
    });
  }, [bookings, now]);

  const maxHours = Math.max(...weekOccupancy.map((d) => d.hours), 1);

  const cardClass =
    "rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft dark:border-neutral-800 dark:bg-neutral-900 sm:p-5";

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-royal-600 text-white shadow-sm shadow-royal-900/20">
          <ChartColumnIncreasing size={20} />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Dashboard
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Resumen general del sistema de reservas.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton h-48 rounded-2xl" />
          <div className="skeleton h-40 rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<ListTodo size={20} />}
              label="Pendientes"
              value={pending.length}
              color="amber"
              link={canManageRequests(user?.role ?? "corporativo") ? "/approvals" : "/"}
            />
            <StatCard
              icon={<CalendarDays size={20} />}
              label="Hoy"
              value={todayBookings.length}
              sub="reservas aprobadas"
              color="emerald"
              link="/availability"
            />
            <StatCard
              icon={<Clock size={20} />}
              label="Próxima reserva"
              value={upcoming.length > 0 ? upcoming[0].expand?.room?.name ?? "\u2014" : "\u2014"}
              sub={upcoming.length > 0 ? formatDateTime(upcoming[0].start) : "Sin reservas"}
              color="electric"
              link="/my-calendar"
            />
            <StatCard
              icon={<Building2 size={20} />}
              label="Salas activas"
              value={String(rooms.length)}
              color="neutral"
              link="/rooms"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className={cardClass}>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                <ChartColumnIncreasing size={16} className="text-royal-600 dark:text-royal-400" />
                Ocupaci&oacute;n semanal (horas aprobadas)
              </h2>
              <div className="flex items-end gap-2">
                {weekOccupancy.map((d) => (
                  <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      {Math.round(d.hours)}h
                    </span>
                    <div
                      className="w-full rounded-lg bg-royal-600 transition-all dark:bg-royal-500"
                      style={{ height: `${Math.max((d.hours / maxHours) * 120, 4)}px` }}
                    />
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      {d.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={cardClass}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  <ListTodo size={16} className="text-royal-600 dark:text-royal-400" />
                  Pendientes &uacute;ltimas
                </h2>
                {canApproveRequests(user?.role ?? "corporativo") && (
                  <Link
                    to="/approvals"
                    className="text-xs font-medium text-royal-600 hover:underline dark:text-royal-400"
                  >
                    Ver todas
                  </Link>
                )}
              </div>
              {pending.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <Inbox size={20} className="text-neutral-300 dark:text-neutral-600" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    No hay solicitudes pendientes.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {pending.slice(0, 5).map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center justify-between rounded-xl border border-neutral-100 px-3 py-2.5 text-sm dark:border-neutral-800"
                    >
                      <div className="min-w-0">
                        <span className="block truncate font-medium text-neutral-800 dark:text-neutral-200">
                          {b.expand?.room?.name ?? "Sala"}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {b.requester_name || b.requester_email}
                        </span>
                      </div>
                      <StatusBadge status="pending" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className={cardClass}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                <FileText size={16} className="text-royal-600 dark:text-royal-400" />
                Pr&oacute;ximas reservas aprobadas
              </h2>
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <CalendarDays size={20} className="text-neutral-300 dark:text-neutral-600" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    No hay reservas aprobadas pr&oacute;ximas.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      <tr>
                        <th className="px-3 py-2 font-medium">Sala</th>
                        <th className="px-3 py-2 font-medium">Fecha</th>
                        <th className="px-3 py-2 font-medium">Solicitante</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcoming.map((b) => (
                        <tr
                          key={b.id}
                          className="border-t border-neutral-100 dark:border-neutral-800"
                        >
                          <td className="px-3 py-2 font-medium text-neutral-800 dark:text-neutral-200">
                            {b.expand?.room?.name ?? "\u2014"}
                          </td>
                          <td className="px-3 py-2 text-neutral-600 dark:text-neutral-400">
                            {formatDateTime(b.start)}
                          </td>
                          <td className="px-3 py-2 text-neutral-600 dark:text-neutral-400">
                            {b.requester_name || b.requester_email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: "amber" | "emerald" | "electric" | "neutral";
  link: string;
}) {
  const colorMap = {
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    electric: "bg-electric-50 text-electric-700 dark:bg-electric-500/15 dark:text-electric-300",
    neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  };

  return (
    <Link
      to={link}
      className="block rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/80"
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${colorMap[color]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">{sub}</p>}
    </Link>
  );
}