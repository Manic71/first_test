import { downloadText, exportAsJsModule, importJsModuleFile } from "../utils/fileio.js";

export function RegistrationPage(state) {
  return `
    <section class="grid gap-6">
      <div class="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-xl font-semibold">Vereine & Teams</h1>
            <p class="text-sm text-slate-500 mt-1">Vereine anlegen und Mannschaften je Altersklasse melden.</p>
          </div>

          <div class="flex gap-2 no-print">
            <button data-action="addClub"
              class="rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white px-4 py-2 text-sm font-semibold shadow-sm">
              + Verein
            </button>

            <button data-action="exportClubs"
              class="rounded-2xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold">
              Export .js
            </button>

            <label class="rounded-2xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-slate-50">
              Import .js
              <input data-action="importClubs" type="file" accept=".js" class="hidden" />
            </label>
          </div>
        </div>

        <div class="mt-6 grid gap-3">
          ${(state.clubs.length ? state.clubs : []).map((c) => clubCard(c, state.tournament.ageGroups)).join("")}
          ${state.clubs.length === 0 ? emptyState() : ""}
        </div>
      </div>
    </section>
  `;
}

function clubCard(club, ageGroups) {
  return `
    <div class="rounded-2xl border border-slate-200 p-4 bg-slate-50/40">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="font-semibold truncate">${escapeHtml(club.name)}</div>
          <div class="text-xs text-slate-500 truncate">${escapeHtml(club.contact?.email || "")}</div>
        </div>
        <button data-action="removeClub" data-id="${club.id}"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
          Entfernen
        </button>
      </div>

      <div class="mt-4 grid md:grid-cols-3 gap-3">
        ${ageGroups.map(ag => `
          <label class="grid gap-1">
            <span class="text-xs font-medium text-slate-600">${ag} Teams</span>
            <input type="number" min="0" data-action="setTeams" data-id="${club.id}" data-ag="${ag}"
              value="${Number(club.teams?.[ag] ?? 0)}"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"/>
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

function emptyState() {
  return `
    <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div class="mx-auto h-12 w-12 rounded-2xl bg-slate-100"></div>
      <div class="mt-3 font-semibold">Noch keine Vereine</div>
      <div class="text-sm text-slate-500 mt-1">Lege Vereine an oder importiere eine .js Datei.</div>
    </div>
  `;
}

window.__bindPage = ((prev) => (route, root, store) => {
  prev?.(route, root, store);
  if (route !== "registration") return;

  root.querySelector("[data-action=addClub]")?.addEventListener("click", () => {
    const id = crypto.randomUUID();
    const clubs = [...store.state.clubs, { id, name: `Verein ${store.state.clubs.length + 1}`, contact: {}, teams: {} }];
    store.setState({ ...store.state, clubs });
  });

  root.querySelectorAll("[data-action=removeClub]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const clubs = store.state.clubs.filter(c => c.id !== id);
      store.setState({ ...store.state, clubs });
    });
  });

  root.querySelectorAll("[data-action=setTeams]").forEach(inp => {
    inp.addEventListener("input", () => {
      const id = inp.dataset.id;
      const ag = inp.dataset.ag;
      const value = Math.max(0, Number(inp.value || 0));
      const clubs = store.state.clubs.map(c => c.id === id
        ? { ...c, teams: { ...(c.teams || {}), [ag]: value } }
        : c
      );
      store.setState({ ...store.state, clubs });
    });
  });

  root.querySelector("[data-action=exportClubs]")?.addEventListener("click", () => {
    const js = exportAsJsModule("clubs", store.state.clubs);
    downloadText("clubs.export.js", js);
  });

  root.querySelector("[data-action=importClubs]")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const clubs = await importJsModuleFile(file, "clubs");
      store.setState({ ...store.state, clubs });
    } catch (err) {
      alert("Import fehlgeschlagen: " + err.message);
    } finally {
      e.target.value = "";
    }
  });
})(window.__bindPage);

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}