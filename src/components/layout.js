import { navigate } from "../router.js";

const navItems = [
  { key: "settings", label: "Settings" },
  { key: "registration", label: "Vereine & Teams" },
  { key: "schedule", label: "Spielplan" },
  { key: "print", label: "Druck/Export" }
];

export function Layout({ route, content }) {
  return `
    <div class="min-h-screen">
      <header class="no-print sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
        <div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-400"></div>
            <div>
              <div class="font-semibold leading-5">Turnier-App</div>
              <div class="text-xs text-slate-500">Planen • Abwickeln • Drucken</div>
            </div>
          </div>

          <nav class="flex gap-1 rounded-2xl bg-slate-100 p-1">
            ${navItems.map(i => `
              <button data-nav="${i.key}"
                class="${route === i.key ? "bg-white shadow-sm" : "hover:bg-white/70"} px-3 py-2 rounded-2xl text-sm font-medium">
                ${i.label}
              </button>
            `).join("")}
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-4 py-6">
        ${content}
      </main>
    </div>
  `;
}

export function bindLayoutEvents(root) {
  root.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.nav));
  });
}