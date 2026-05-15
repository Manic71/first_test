import { generateSchedule } from "./schedule.generate.js";

export function SchedulePage(state) {
  return `
    <section class="grid gap-6">
      <div class="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-xl font-semibold">Spielplan</h1>
            <p class="text-sm text-slate-500 mt-1">Automatisch generieren oder später manuell anpassen.</p>
          </div>

          <div class="flex gap-2 no-print">
            <button data-action="autoSchedule"
              class="rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white px-4 py-2 text-sm font-semibold shadow-sm">
              Auto-Spielplan
            </button>
          </div>
        </div>

        <div class="mt-6 grid gap-4">
          ${renderFieldOverview(state)}
        </div>
      </div>
    </section>
  `;
}

function renderFieldOverview(state) {
  const fields = state.tournament.fields || [];
  const allGames = Object.values(state.schedule.byAgeGroup || {}).flat();
  return `
    <div class="grid md:grid-cols-3 gap-3">
      ${fields.map(f => {
        const games = allGames
          .filter(g => g.field === f)
          .sort((a,b) => (a.timeMin ?? 0) - (b.timeMin ?? 0));
        return `
          <div class="rounded-2xl border border-slate-200 p-4 bg-slate-50/40">
            <div class="font-semibold">Feld ${f}</div>
            <div class="mt-3 grid gap-2">
              ${games.slice(0, 8).map(g => `
                <div class="rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm">
                  <div class="text-xs text-slate-500">${g.time} • ${g.ageGroup}</div>
                  <div class="font-medium">${g.home} vs ${g.away}</div>
                </div>
              `).join("")}
              ${games.length === 0 ? `<div class="text-sm text-slate-500">Noch keine Spiele</div>` : ""}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

window.__bindPage = ((prev) => (route, root, store) => {
  prev?.(route, root, store);
  if (route !== "schedule") return;

  root.querySelector("[data-action=autoSchedule]")?.addEventListener("click", () => {
    const { byAgeGroup } = generateSchedule(store.state);
    store.setState({ ...store.state, schedule: { byAgeGroup } });
  });
})(window.__bindPage);