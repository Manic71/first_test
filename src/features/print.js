import { downloadText, exportAsJsModule } from "../utils/fileio.js";

export function PrintPage(state) {
  return `
    <section class="grid gap-6">
      <div class="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
        <h1 class="text-xl font-semibold">Druck / Export</h1>
        <p class="text-sm text-slate-500 mt-1">Aushänge je Feld / Team + Erfassungsformulare.</p>

        <div class="mt-6 flex flex-wrap gap-2 no-print">
          <button data-action="printField" class="rounded-2xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold">
            Druck: Feldplan
          </button>
          <button data-action="printTeam" class="rounded-2xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold">
            Druck: Teampläne
          </button>
          <button data-action="printForms" class="rounded-2xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold">
            Druck: Erfassungsformulare
          </button>
          <button data-action="exportVenues" class="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">
            Export Spielorte .js
          </button>
        </div>

        <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50/40 p-6 print-page">
          <div class="text-sm text-slate-600">Wähle oben eine Druckart – hier wird die Druckansicht gerendert.</div>
          <div id="printTarget" class="mt-4"></div>
        </div>
      </div>
    </section>
  `;
}

window.__bindPage = ((prev) => (route, root, store) => {
  prev?.(route, root, store);
  if (route !== "print") return;

  const target = root.querySelector("#printTarget");

  root.querySelector("[data-action=printField]")?.addEventListener("click", () => {
    target.innerHTML = renderFieldPrint(store.state);
    window.print();
  });

  root.querySelector("[data-action=printTeam]")?.addEventListener("click", () => {
    target.innerHTML = renderTeamPrint(store.state);
    window.print();
  });

  root.querySelector("[data-action=printForms]")?.addEventListener("click", () => {
    target.innerHTML = renderForms(store.state);
    window.print();
  });

  root.querySelector("[data-action=exportVenues]")?.addEventListener("click", () => {
    const js = exportAsJsModule("venues", store.state.venues);
    downloadText("venues.export.js", js);
  });
})(window.__bindPage);

function getOrganizerName(state) {
  const id = state.tournament.organizerId;
  const org = (state.organizers || []).find(o => o.id === id);
  return org?.name || "—";
}

function renderFieldPrint(state) {
  const organizerName = getOrganizerName(state);
  const fields = state.tournament.fields || [];
  const allGames = Object.values(state.schedule.byAgeGroup || {})
    .flat()
    .sort((a, b) => (a.timeMin ?? 0) - (b.timeMin ?? 0));

  return `
    <div class="grid gap-6">
      <div>
        <div class="text-lg font-semibold">Veranstalter: ${escapeHtml(organizerName)}</div>
        <div class="text-sm text-slate-500">${escapeHtml(state.tournament.date)}</div>
      </div>
      ${fields.map(f => {
        const games = allGames.filter(g => g.field === f);
        return `
          <div class="rounded-2xl bg-white border border-slate-200 p-4">
            <div class="font-semibold">Spielfeld ${f}</div>
            <div class="mt-3 grid gap-2">
              ${games.map(g => `
                <div class="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm">
                  <div class="text-slate-500 w-20">${g.time}</div>
                  <div class="flex-1 font-medium">${g.home} – ${g.away}</div>
                  <div class="text-slate-500 w-16 text-right">${g.ageGroup}</div>
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

function renderTeamPrint(state) {
  const organizerName = getOrganizerName(state);
  const allGames = Object.values(state.schedule.byAgeGroup || {})
    .flat()
    .sort((a, b) => (a.timeMin ?? 0) - (b.timeMin ?? 0));
  const teams = [...new Set(allGames.flatMap(g => [g.home, g.away]))];

  return `
    <div class="grid gap-8">
      <div>
        <div class="text-lg font-semibold">Veranstalter: ${escapeHtml(organizerName)}</div>
        <div class="text-sm text-slate-500">${escapeHtml(state.tournament.date)}</div>
      </div>

      ${teams.map(team => {
        const games = allGames.filter(g => g.home === team || g.away === team);
        return `
          <div class="rounded-2xl bg-white border border-slate-200 p-4 break-after-page">
            <div class="text-lg font-semibold">${escapeHtml(team)}</div>
            <div class="mt-3 grid gap-2">
              ${games.map(g => `
                <div class="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm">
                  <div class="text-slate-500 w-20">${g.time}</div>
                  <div class="flex-1 font-medium">${g.home} – ${g.away}</div>
                  <div class="text-slate-500 w-16 text-right">Feld ${g.field}</div>
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

function renderForms(state) {
  const organizerName = getOrganizerName(state);
  const ageGroups = state.tournament.ageGroups || [];

  return `
    <div class="grid gap-8">
      <div>
        <div class="text-lg font-semibold">Veranstalter: ${escapeHtml(organizerName)}</div>
        <div class="text-sm text-slate-500">${escapeHtml(state.tournament.date)}</div>
      </div>

      ${ageGroups.map(ag => {
        const clubs = state.clubs.filter(c => Number(c.teams?.[ag] ?? 0) > 0);
        return `
          <div class="rounded-2xl bg-white border border-slate-200 p-4 break-after-page">
            <div class="text-lg font-semibold">Erfassungsformular ${ag}</div>
            <div class="text-sm text-slate-500 mt-1">Check-in / Nachmeldungen</div>

            <div class="mt-4 grid gap-2">
              ${clubs.map(c => `
                <div class="flex items-center justify-between border-b border-slate-100 py-2">
                  <div>
                    <div class="font-medium">${escapeHtml(c.name)}</div>
                    <div class="text-xs text-slate-500">Teams: ${Number(c.teams?.[ag] ?? 0)}</div>
                  </div>
                  <div class="w-28 h-10 border border-slate-200 rounded-xl"></div>
                </div>
              `).join("")}

              ${Array.from({ length: 6 }).map(() => `
                <div class="flex items-center justify-between border-b border-slate-100 py-2">
                  <div class="w-64 h-6 border border-slate-200 rounded-lg"></div>
                  <div class="w-28 h-10 border border-slate-200 rounded-xl"></div>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}