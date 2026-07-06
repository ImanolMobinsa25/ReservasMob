import logoUrl from "../../assets/logo.png";

export function Logo() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
        <img src={logoUrl} alt="" className="h-6 w-6 object-contain dark:invert" />
      </span>
      <span className="text-sm font-semibold leading-tight tracking-tight text-neutral-900 dark:text-neutral-100">
        Sala de Reuniones
      </span>
    </div>
  );
}
