import { useState } from "react";
import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  ChartColumnIncreasing,
  CheckCheck,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PlusCircle,
  Sun,
  User,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { canApproveRequests, canManageRequests, canManageUsers, ROLE_LABELS } from "../../lib/types";
import { Logo } from "./Logo";
import { NotificationBell } from "./NotificationBell";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
    isActive
      ? "bg-royal-600 text-white shadow-sm shadow-royal-900/20"
      : "text-neutral-600 hover:bg-royal-50 hover:text-royal-700 dark:text-neutral-400 dark:hover:bg-royal-500/10 dark:hover:text-royal-300"
  }`;

function NavIcon({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
        isActive
          ? "bg-white/15 text-white"
          : "bg-neutral-100 text-neutral-500 group-hover:bg-royal-100 group-hover:text-royal-600 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-royal-500/20 dark:group-hover:text-royal-300"
      }`}
    >
      {children}
    </span>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      <NavLink to="/" end className={navItemClass} onClick={() => setOpen(false)}>
        {({ isActive }) => (
          <>
            <NavIcon isActive={isActive}>
              <ClipboardList size={16} />
            </NavIcon>
            Solicitudes
          </>
        )}
      </NavLink>
      <NavLink to="/bookings/new" className={navItemClass} onClick={() => setOpen(false)}>
        {({ isActive }) => (
          <>
            <NavIcon isActive={isActive}>
              <PlusCircle size={16} />
            </NavIcon>
            Nueva solicitud
          </>
        )}
      </NavLink>
      <NavLink to="/availability" className={navItemClass} onClick={() => setOpen(false)}>
        {({ isActive }) => (
          <>
            <NavIcon isActive={isActive}>
              <CalendarDays size={16} />
            </NavIcon>
            Disponibilidad
          </>
        )}
      </NavLink>
      <NavLink to="/my-calendar" className={navItemClass} onClick={() => setOpen(false)}>
        {({ isActive }) => (
          <>
            <NavIcon isActive={isActive}>
              <CalendarDays size={16} />
            </NavIcon>
            Mi calendario
          </>
        )}
      </NavLink>
      <NavLink to="/room-timeline" className={navItemClass} onClick={() => setOpen(false)}>
        {({ isActive }) => (
          <>
            <NavIcon isActive={isActive}>
              <CalendarDays size={16} />
            </NavIcon>
            Timeline salas
          </>
        )}
      </NavLink>
      <NavLink to="/profile" className={navItemClass} onClick={() => setOpen(false)}>
        {({ isActive }) => (
          <>
            <NavIcon isActive={isActive}>
              <User size={16} />
            </NavIcon>
            Mi perfil
          </>
        )}
      </NavLink>
      {canManageRequests(user.role) && (
        <NavLink to="/dashboard" className={navItemClass} onClick={() => setOpen(false)}>
          {({ isActive }) => (
            <>
              <NavIcon isActive={isActive}>
                <LayoutDashboard size={16} />
              </NavIcon>
              Dashboard
            </>
          )}
        </NavLink>
      )}
      {canApproveRequests(user.role) && (
        <NavLink to="/approvals" className={navItemClass} onClick={() => setOpen(false)}>
          {({ isActive }) => (
            <>
              <NavIcon isActive={isActive}>
                <CheckCheck size={16} />
              </NavIcon>
              Aprobaciones
            </>
          )}
        </NavLink>
      )}
      
      {canManageRequests(user.role) && (
        <NavLink to="/reports" className={navItemClass} onClick={() => setOpen(false)}>
          {({ isActive }) => (
            <>
              <NavIcon isActive={isActive}>
                <ChartColumnIncreasing size={16} />
              </NavIcon>
              Reportes
            </>
          )}
        </NavLink>
      )}
      {canManageUsers(user.role) && (
        <NavLink to="/rooms" className={navItemClass} onClick={() => setOpen(false)}>
          {({ isActive }) => (
            <>
              <NavIcon isActive={isActive}>
                <Building2 size={16} />
              </NavIcon>
              Salas
            </>
          )}
        </NavLink>
      )}
      {canManageUsers(user.role) && (
        <NavLink to="/users" className={navItemClass} onClick={() => setOpen(false)}>
          {({ isActive }) => (
            <>
              <NavIcon isActive={isActive}>
                <Users size={16} />
              </NavIcon>
              Usuarios
            </>
          )}
        </NavLink>
      )}
    </nav>
  );

  return (
    <div className="bg-app-gradient min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80 md:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationBell />
          <button
            aria-label="Abrir menú"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar de escritorio */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-200 bg-white/90 py-5 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/90 md:flex">
          <div className="flex items-center justify-between px-4 pb-6">
            <Logo />
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
          {nav}
          <UserFooter email={user.email} role={ROLE_LABELS[user.role]} onLogout={logout} />
        </aside>

        {/* Overlay + panel deslizante móvil */}
        <div
          className={`fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
            open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-neutral-200 bg-white py-5 shadow-soft-lg transition-transform duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-950 md:hidden ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 pb-6">
            <Logo />
            <button
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <X size={20} />
            </button>
          </div>
          {nav}
          <UserFooter email={user.email} role={ROLE_LABELS[user.role]} onLogout={logout} />
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-5xl animate-[fadeIn_0.25s_ease-out]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function UserFooter({
  email,
  role,
  onLogout,
}: {
  email: string;
  role: string;
  onLogout: () => void;
}) {
  const initial = email.charAt(0).toUpperCase();
  return (
    <div className="mt-auto border-t border-neutral-200 px-4 pt-4 dark:border-neutral-800">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-royal-100 text-sm font-semibold text-royal-700 dark:bg-royal-500/20 dark:text-royal-300">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
            {email}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{role}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
      >
        <LogOut size={16} /> Cerrar sesión
      </button>
    </div>
  );
}
