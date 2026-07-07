import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // El sitio se publica en GitHub Pages bajo /ReservasMob/ (no en la raíz del
  // dominio), así que el build necesita esa base para que los assets y las
  // rutas del cliente resuelvan bien. En dev (npm run dev) se sigue usando "/".
  base: command === "build" ? "/ReservasMob/" : "/",
}));
