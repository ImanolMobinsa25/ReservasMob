import type { ReactNode } from "react";

export function ExtraOptionCard({
  icon,
  label,
  checked,
  onChange,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`group flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 text-center transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked
          ? "border-royal-400 bg-royal-50 shadow-sm ring-1 ring-royal-300 dark:border-royal-500/50 dark:bg-royal-500/15 dark:ring-royal-500/30"
          : "border-neutral-200 bg-white hover:border-royal-200 hover:bg-royal-50/40 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-royal-500/30 dark:hover:bg-royal-500/5"
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          checked
            ? "bg-royal-600 text-white"
            : "bg-neutral-100 text-neutral-500 group-hover:bg-royal-100 group-hover:text-royal-600 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-royal-500/20 dark:group-hover:text-royal-300"
        }`}
      >
        {icon}
      </span>
      <span
        className={`text-xs font-medium ${
          checked
            ? "text-royal-800 dark:text-royal-200"
            : "text-neutral-600 dark:text-neutral-400"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
