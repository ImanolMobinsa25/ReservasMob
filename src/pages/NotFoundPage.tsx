import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="bg-app-gradient flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50 px-4 text-center dark:bg-neutral-950">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-royal-600 text-white shadow-sm shadow-royal-900/20">
        <Compass size={28} />
      </span>
      <div>
        <p className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">404</p>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Página no encontrada.
        </p>
      </div>
      <Link
        to="/"
        className="rounded-xl bg-royal-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-royal-900/10 transition-colors hover:bg-royal-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
