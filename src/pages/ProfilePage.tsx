import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { CalendarDays, Lock, Save, User } from "lucide-react";
import { ClientResponseError } from "pocketbase";
import { useAuth } from "../context/AuthContext";
import { pb } from "../lib/pocketbase";
import type { Booking } from "../lib/types";
import { ROLE_LABELS } from "../lib/types";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import { Alert } from "../components/ui/Alert";
import { StatusBadge } from "../components/ui/Badge";
import { formatDateTime, isPast } from "../utils/dateRange";

export function ProfilePage() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) return;
    pb.collection("bookings")
      .getList<Booking>(1, 5, {
        filter: pb.filter("requested_by = {:id}", { id: user.id }),
        sort: "-created",
        expand: "room",
      })
      .then((result) => setRecentBookings(result.items));
  }, [user]);

  async function handleProfileUpdate(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setProfileError(null);
    setProfileSuccess(false);
    if (!name.trim()) return setProfileError("El nombre no puede estar vacío.");
    setProfileLoading(true);
    try {
      await pb.collection("users").update(user.id, { name: name.trim() });
      setProfileSuccess(true);
    } catch {
      setProfileError("No se pudieron guardar los cambios.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!currentPassword) return setPasswordError("Ingresa tu contraseña actual.");
    if (newPassword.length < 8)
      return setPasswordError("La nueva contraseña debe tener al menos 8 caracteres.");
    if (newPassword !== confirmPassword)
      return setPasswordError("Las contraseñas no coinciden.");
    setPasswordLoading(true);
    try {
      await pb.collection("users").update(user.id, {
        oldPassword: currentPassword,
        password: newPassword,
        passwordConfirm: confirmPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof ClientResponseError && err.status === 400) {
        setPasswordError("La contraseña actual no es correcta.");
      } else {
        setPasswordError("No se pudo cambiar la contraseña.");
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  if (!user) return null;

  const avatarInitial = (user.name || user.email).charAt(0).toUpperCase();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-royal-600 text-white shadow-sm shadow-royal-900/20">
          <User size={20} />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Mi perfil
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Administra tus datos personales y preferencias.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-royal-100 text-xl font-bold text-royal-700 dark:bg-royal-500/20 dark:text-royal-300">
                {avatarInitial}
              </span>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {user.name || "Sin nombre"}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
                <p className="text-xs font-medium text-royal-600 dark:text-royal-400">
                  {ROLE_LABELS[user.role]}
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-3">
              <Input
                label="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Alert
                variant="success"
                message={profileSuccess && "Nombre actualizado correctamente."}
              />
              <Alert variant="error" message={profileError} />
              <Button type="submit" loading={profileLoading}>
                <Save size={16} /> Guardar nombre
              </Button>
            </form>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Cambiar contraseña
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <Input
                label="Contraseña actual"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                icon={<Lock size={16} />}
              />
              <Input
                label="Nueva contraseña"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={<Lock size={16} />}
              />
              <Input
                label="Confirmar contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock size={16} />}
              />
              <Alert
                variant="success"
                message={passwordSuccess && "Contraseña actualizada correctamente."}
              />
              <Alert variant="error" message={passwordError} />
              <Button type="submit" variant="secondary" loading={passwordLoading}>
Cambiar contraseña
              </Button>
            </form>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <CalendarDays size={16} className="text-royal-600 dark:text-royal-400" />
            Mis últimas reservas
          </h2>
          {recentBookings.length === 0 ? (
            <p className="py-4 text-sm text-neutral-400 dark:text-neutral-500">
              Aún no tienes reservas.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentBookings.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-100 px-3 py-2.5 text-sm dark:border-neutral-800"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-800 dark:text-neutral-200">
                      {b.expand?.room?.name ?? "Sala"}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatDateTime(b.start)}
                    </p>
                  </div>
                  <StatusBadge status={b.status} past={isPast(b.end)} cancelled={b.cancelled} attended={b.attended} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}