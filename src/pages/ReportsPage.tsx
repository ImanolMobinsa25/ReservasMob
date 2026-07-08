import { useEffect, useMemo, useState } from "react";
import { ChartColumnIncreasing, Download, Filter, Inbox } from "lucide-react";
import { pb } from "../lib/pocketbase";
import { useRooms } from "../hooks/useRooms";
import type { Booking, BookingStatus } from "../lib/types";
import { StatusBadge } from "../components/ui/Badge";
import { Input, Select } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { formatRange, isPast } from "../utils/dateRange";

export function ReportsPage() {
  const { rooms } = useRooms();
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [roomFilter, setRoomFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setLoading(true);
    pb.collection("bookings")
      .getFullList<Booking>({
        sort: "-start",
        expand: "room,requested_by",
      })
      .then(setAllBookings)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = allBookings;
    if (roomFilter) list = list.filter((b) => b.room === roomFilter);
    if (statusFilter) list = list.filter((b) => b.status === statusFilter);
    if (startDate) {
      const sd = new Date(startDate);
      list = list.filter((b) => new Date(b.start) >= sd);
    }
    if (endDate) {
      const ed = new Date(endDate);
      ed.setHours(23, 59, 59, 999);
      list = list.filter((b) => new Date(b.start) <= ed);
    }
    return list;
  }, [allBookings, roomFilter, statusFilter, startDate, endDate]);

  const stats = useMemo(() => {
    const roomUsage: Record<string, number> = {};
    const userUsage: Record<string, { name: string; count: number }> = {};
    const hourlyCount: Record<string, number> = {};

    allBookings
      .filter((b) => b.status === "approved" && !b.cancelled)
      .forEach((b) => {
        const roomName = b.expand?.room?.name ?? "Desconocida";
        roomUsage[roomName] = (roomUsage[roomName] || 0) + 1;

        const userName = b.requester_name || b.requester_email;
        if (!userUsage[userName]) userUsage[userName] = { name: userName, count: 0 };
        userUsage[userName].count += 1;

        const hour = new Date(b.start).getHours();
        const key = `${String(hour).padStart(2, "0")}:00`;
        hourlyCount[key] = (hourlyCount[key] || 0) + 1;
      });

    const topRoom = Object.entries(roomUsage).sort((a, b) => b[1] - a[1])[0];
    const topUser = Object.values(userUsage).sort((a, b) => b.count - a.count)[0];
    const topHour = Object.entries(hourlyCount).sort((a, b) => b[1] - a[1])[0];

    const allApproved = allBookings.filter((b) => b.status === "approved");
    return {
      totalApproved: allApproved.filter((b) => !b.cancelled).length,
      totalRejected: allBookings.filter((b) => b.status === "rejected").length,
      totalPending: allBookings.filter((b) => b.status === "pending").length,
      totalCancelled: allApproved.filter((b) => b.cancelled).length,
      totalNoShow: allApproved.filter((b) => !b.cancelled && isPast(b.end) && !b.attended).length,
      topRoom: topRoom ? `${topRoom[0]} (${topRoom[1]} veces)` : "\u2014",
      topUser: topUser ? `${topUser.name} (${topUser.count} reservas)` : "\u2014",
      topHour: topHour ? `${topHour[0]} (${topHour[1]} reservas)` : "\u2014",
    };
  }, [allBookings]);

  function statusLabel(b: Booking) {
    if (b.status === "pending") return "Pendiente";
    if (b.status === "rejected") return "Rechazada";
    if (b.cancelled) return "Cancelada";
    if (b.status === "approved" && isPast(b.end) && !b.attended) return "Solicitó y no usó";
    if (b.status === "approved" && isPast(b.end) && b.attended) return "Asistió";
    if (b.status === "approved") return "Aprobada";
    return b.status;
  }

  function extrasLabel(b: Booking) {
    const items: string[] = [];
    if (b.wants_coffee) items.push("Caf\u00e9" + (b.coffee_approved ? "" : " (no)"));
    if (b.wants_cookies) items.push("Galletas" + (b.cookies_approved ? "" : " (no)"));
    if (b.wants_water) items.push("Agua" + (b.water_approved ? "" : " (no)"));
    if (b.wants_snack) items.push("Snack" + (b.snack_approved ? "" : " (no)"));
    return items.join("; ") || "Ninguno";
  }

  function exportCSV() {
    const headers = [
      "ID",
      "Sala",
      "Fecha",
      "Inicio",
      "Fin",
      "Estado",
      "Solicitante",
      "Correo",
      "Motivo",
      "Personas",
      "Extras solicitados",
      "Cancelada",
      "Asistió",
    ];
    const rows = filtered.map((b) => {
      const start = new Date(b.start);
      const end = new Date(b.end);
      const dateStr = start.toLocaleDateString("es-MX", {
        day: "2-digit", month: "2-digit", year: "numeric",
      });
      const timeStart = start.toLocaleTimeString("es-MX", {
        hour: "2-digit", minute: "2-digit", hour12: true,
      });
      const timeEnd = end.toLocaleTimeString("es-MX", {
        hour: "2-digit", minute: "2-digit", hour12: true,
      });
      return [
        b.id,
        b.expand?.room?.name ?? "",
        dateStr,
        timeStart,
        timeEnd,
        statusLabel(b),
        b.requester_name || "",
        b.requester_email,
        b.reason,
        String(b.people_count),
        extrasLabel(b),
        b.cancelled ? "Sí" : "No",
        b.attended ? "Sí" : b.status === "approved" && isPast(b.end) ? "No" : "Pendiente",
      ];
    });

    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join(
      "\n",
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-reservas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const cardClass =
    "rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft dark:border-neutral-800 dark:bg-neutral-900 sm:p-5";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-royal-600 text-white shadow-sm shadow-royal-900/20">
            <ChartColumnIncreasing size={20} />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Reportes / Historial
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Consulta el hist&oacute;rico completo con filtros avanzados.
            </p>
          </div>
        </div>
        <Button onClick={exportCSV} disabled={filtered.length === 0}>
          <Download size={16} /> Exportar CSV
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Aprobadas", value: stats.totalApproved, color: "emerald" },
          { label: "Rechazadas", value: stats.totalRejected, color: "red" },
          { label: "Pendientes", value: stats.totalPending, color: "amber" },
          { label: "Canceladas", value: stats.totalCancelled, color: "neutral" },
          { label: "No asistió", value: stats.totalNoShow, color: "red" },
          { label: "Total", value: allBookings.length, color: "neutral" },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-3 ${
              s.color === "emerald"
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                : s.color === "red"
                  ? "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10"
                  : s.color === "amber"
                    ? "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10"
                    : "border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800"
            }`}
          >
            <p className="text-xs font-medium opacity-80">{s.label}</p>
            <p className="mt-0.5 text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className={cardClass}>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          <ChartColumnIncreasing size={16} className="text-royal-600 dark:text-royal-400" />
          Estad&iacute;sticas generales
        </h2>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <span className="text-neutral-500 dark:text-neutral-400">Sala m&aacute;s usada:</span>
            <p className="font-medium text-neutral-800 dark:text-neutral-200">{stats.topRoom}</p>
          </div>
          <div>
            <span className="text-neutral-500 dark:text-neutral-400">Usuario top:</span>
            <p className="font-medium text-neutral-800 dark:text-neutral-200">{stats.topUser}</p>
          </div>
          <div>
            <span className="text-neutral-500 dark:text-neutral-400">Hora pico:</span>
            <p className="font-medium text-neutral-800 dark:text-neutral-200">{stats.topHour}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className={cardClass}>
          <div className="mb-4 flex items-center gap-2">
            <Filter size={16} className="text-royal-600 dark:text-royal-400" />
            <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Filtrar resultados
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select label="Sala" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
              <option value="">Todas las salas</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
            <Select
              label="Estado"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "")}
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
            </Select>
            <Input
              label="Fecha inicio"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Fecha fin"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className={cardClass}>
          <div className="mb-3 flex items-center gap-2">
            <ChartColumnIncreasing size={16} className="text-royal-600 dark:text-royal-400" />
            <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Resultados ({filtered.length})
            </h2>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Inbox size={24} className="text-neutral-300 dark:text-neutral-600" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No hay solicitudes con esos filtros.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">Sala</th>
                    <th className="px-3 py-2 font-medium">Horario</th>
                    <th className="px-3 py-2 font-medium">Solicitante</th>
                    <th className="px-3 py-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr
                      key={b.id}
                      className="border-t border-neutral-100 dark:border-neutral-800"
                    >
                      <td className="px-3 py-2 font-medium text-neutral-800 dark:text-neutral-200">
                        {b.expand?.room?.name ?? "\u2014"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                        {formatRange(b.start, b.end)}
                      </td>
                      <td className="px-3 py-2 text-neutral-600 dark:text-neutral-400">
                        {b.requester_name || b.requester_email}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={b.status} past={isPast(b.end)} cancelled={b.cancelled} attended={b.attended} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}