import { useEffect, useState } from "react";
import { ShieldCheck, Users as UsersIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { pb } from "../lib/pocketbase";
import { canAssignRoles, ROLE_LABELS } from "../lib/types";
import type { Role, UserRecord } from "../lib/types";
import { Alert } from "../components/ui/Alert";

const ALL_ROLES: Role[] = ["corporativo", "rh", "admin", "adminvip"];

const ROLE_BADGE: Record<Role, string> = {
  corporativo:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  rh: "bg-electric-50 text-electric-700 dark:bg-electric-500/15 dark:text-electric-300",
  admin: "bg-royal-50 text-royal-700 dark:bg-royal-500/15 dark:text-royal-300",
  adminvip:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

const AVATAR_PALETTE = [
  "bg-royal-100 text-royal-700 dark:bg-royal-500/20 dark:text-royal-300",
  "bg-electric-100 text-electric-700 dark:bg-electric-500/20 dark:text-electric-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
];

function avatarClass(seed: string) {
  const idx = seed.charCodeAt(0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

export function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canEdit = user ? canAssignRoles(user.role) : false;

  useEffect(() => {
    pb.collection("users")
      .getFullList<UserRecord>({ sort: "email" })
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function changeRole(id: string, role: Role) {
    setError(null);
    const previous = users;
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, role } : u)));
    try {
      await pb.collection("users").update(id, { role });
    } catch {
      setUsers(previous);
      setError("No se pudo cambiar el rol.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-royal-600 text-white shadow-sm shadow-royal-900/20">
          <UsersIcon size={20} />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Usuarios
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            {canEdit && <ShieldCheck size={14} className="text-amber-500" />}
            {canEdit
              ? "Como Admin VIP puedes asignar o cambiar el rol de cualquier usuario."
              : "Lista de usuarios registrados en el sistema."}
          </p>
        </div>
      </div>

      <Alert variant="error" className="mb-4" message={error} />

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-soft dark:border-neutral-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarClass(u.email)}`}
                        >
                          {u.email.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-neutral-800 dark:text-neutral-200">
                            {u.name || u.email}
                          </p>
                          {u.name && (
                            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                              {u.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {canEdit ? (
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value as Role)}
                          className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-sm outline-none transition-colors hover:border-neutral-400 focus:border-electric-500 focus:ring-4 focus:ring-electric-500/10 dark:border-neutral-700 dark:bg-neutral-900"
                        >
                          {ALL_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_BADGE[u.role]}`}
                        >
                          {ROLE_LABELS[u.role]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
