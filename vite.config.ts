import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // Relative asset paths let the same build work at a domain root or subfolder.
  base: "./",
});
