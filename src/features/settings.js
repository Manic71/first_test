import { timeToMin, minToTime } from "../utils/time.js";

export function SettingsPage(state) {
  const t = state.tournament;
  const orgs = state.organizers || [];
  const venues = state.venues || [];

  const startMin = safeTimeToMin(t.startTime);
  const endMin = safeTimeToMin(t.endTime);
  const timeInvalid = Number.isFinite(startMin) && Number.isFinite(endMin) && startMin > endMin;

  const timeInputClass = (isInvalid) =>
    `h-10 w-full rounded-xl border bg-white pl-11 pr-11 px-3 outline-none focus:ring-2 ${
      isInvalid
        ? "border-rose-300 focus:ring-rose-200"
        : "border-slate-200 focus:ring-blue-200"
    }`;

  return `
    <section class="grid gap-6">
      <div class="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
        <h1 class="text-xl font-semibold">Settings</h1>
        <p class="text-sm text-slate-500 mt-1">Grunddaten & Zeitplanung.</p>

        <div class="grid md:grid-cols-2 gap-4 mt-6">

          <!-- Veranstalter -->
          <label class="grid gap-1">
            <span class="text-sm font-medium">Veranstalter</span>
            <select data-path="tournament.organizerId"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200">
              ${orgs.length === 0 ? `<option value="">Keine Veranstalter vorhanden</option>` : ""}
              ${orgs.map(o => `
                <option value="${escapeHtml(o.id)}" ${t.organizerId === o.id ? "selected" : ""}>
                  ${escapeHtml(o.name)}
                </option>
              `).join("")}
            </select>
            ${orgs.length === 0 ? `<span class="text-xs text-slate-500">Lege Veranstalter in src/data/organizers.sample.js an.</span>` : ""}
          </label>

          <!-- Austragungsort -->
          <label class="grid gap-1">
            <span class="text-sm font-medium">Austragungsort</span>
            <select data-path="tournament.venueId"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200">
              ${venues.length === 0 ? `<option value="">Keine Austragungsorte vorhanden</option>` : ""}
              ${venues.map(v => `
                <option value="${escapeHtml(v.id)}" ${t.venueId === v.id ? "selected" : ""}>
                  ${escapeHtml(v.name)}
                </option>
              `).join("")}
            </select>
            ${venues.length === 0 ? `<span class="text-xs text-slate-500">Lege Austragungsorte in src/data/venues.sample.js an.</span>` : ""}
          </label>

          <!-- Datum -->
          <label class="grid gap-1">
            <span class="text-sm font-medium">Datum</span>
            <input type="date" data-path="tournament.date" value="${escapeHtml(t.date)}"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"/>
          </label>

          <div class="hidden md:block"></div>

          <!-- ZEILE: Beginnzeit, Endezeit, Spielzeit, Pause -->
          <div class="md:col-span-2">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">

              <!-- Beginnzeit (Buttons im Feld integriert) -->
              <label class="grid gap-1">
                <span class="text-sm font-medium">Beginnzeit</span>

                <div class="relative">
                  ${iconButtonEmbedded({
                    side: "left",
                    action: "stepTime",
                    path: "tournament.startTime",
                    delta: -15,
                    label: "Beginnzeit -15 Minuten",
                    icon: "minus"
                  })}

                  <input type="time" data-path="tournament.startTime" value="${escapeHtml(t.startTime)}"
                    class="${timeInputClass(timeInvalid)}"/>

                  ${iconButtonEmbedded({
                    side: "right",
                    action: "stepTime",
                    path: "tournament.startTime",
                    delta: 15,
                    label: "Beginnzeit +15 Minuten",
                    icon: "plus"
                  })}
                </div>

                <span class="text-[11px] text-slate-500">± 15 Min</span>
              </label>

              <!-- Endezeit (Buttons im Feld integriert) -->
              <label class="grid gap-1">
                <span class="text-sm font-medium">Endezeit</span>

                <div class="relative">
                  ${iconButtonEmbedded({
                    side: "left",
                    action: "stepTime",
                    path: "tournament.endTime",
                    delta: -15,
                    label: "Endezeit -15 Minuten",
                    icon: "minus"
                  })}

                  <input type="time" data-path="tournament.endTime" value="${escapeHtml(t.endTime)}"
                    class="${timeInputClass(timeInvalid)}"/>

                  ${iconButtonEmbedded({
                    side: "right",
                    action: "stepTime",
                    path: "tournament.endTime",
                    delta: 15,
                    label: "Endezeit +15 Minuten",
                    icon: "plus"
                  })}
                </div>

                <span class="text-[11px] text-slate-500">± 15 Min</span>
              </label>

              <!-- Spielzeit -->
              <label class="grid gap-1">
                <span class="text-sm font-medium">Spielzeit</span>
                <div class="flex items-center gap-2">
                  ${iconButton({
                    action: "stepNumber",
                    path: "tournament.gameDurationMin",
                    delta: -1,
                    min: 1,
                    label: "Spielzeit -1 Minute",
                    icon: "minus"
                  })}

                  <input type="number" min="1" data-path="tournament.gameDurationMin" value="${Number(t.gameDurationMin)}"
                    class="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 outline-none focus:ring-2 focus:ring-blue-200"/>

                  ${iconButton({
                    action: "stepNumber",
                    path: "tournament.gameDurationMin",
                    delta: 1,
                    min: 1,
                    label: "Spielzeit +1 Minute",
                    icon: "plus"
                  })}
                </div>
                <span class="text-[11px] text-slate-500">± 1 Min</span>
              </label>

              <!-- Pause -->
              <label class="grid gap-1">
                <span class="text-sm font-medium">Pause</span>
                <div class="flex items-center gap-2">
                  ${iconButton({
                    action: "stepNumber",
                    path: "tournament.breakMin",
                    delta: -1,
                    min: 0,
                    label: "Pause -1 Minute",
                    icon: "minus"
                  })}

                  <input type="number" min="0" data-path="tournament.breakMin" value="${Number(t.breakMin)}"
                    class="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 outline-none focus:ring-2 focus:ring-blue-200"/>

                  ${iconButton({
                    action: "stepNumber",
                    path: "tournament.breakMin",
                    delta: 1,
                    min: 0,
                    label: "Pause +1 Minute",
                    icon: "plus"
                  })}
                </div>
                <span class="text-[11px] text-slate-500">± 1 Min</span>
              </label>

            </div>

            <!-- VALIDIERUNGSWARNUNG -->
            ${
              timeInvalid
                ? `
                <div class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-start gap-3">
                  <div class="mt-0.5 text-rose-600">${alertIcon()}</div>
                  <div>
                    <div class="text-sm font-semibold text-rose-700">Ungültige Zeitspanne</div>
                    <div class="text-sm text-rose-700/90">
                      Beginnzeit darf nicht später als Endezeit sein.
                    </div>
                  </div>
                </div>
              `
                : ""
            }
          </div>

        </div>
      </div>
    </section>
  `;
}

// Bindings: inputs/selects auf store.patch mappen + Stepper Buttons
window.__bindPage = window.__bindPage || function(){};
const prev = window.__bindPage;

window.__bindPage = (route, root, store) => {
  prev(route, root, store);
  if (route !== "settings") return;

  // Standard inputs/selects
  root.querySelectorAll("[data-path]").forEach(el => {
    el.addEventListener("input", () => {
      const path = el.dataset.path;
      const value = el.type === "number" ? Number(el.value) : el.value;
      store.patch(path, value);
    });

    el.addEventListener("change", () => {
      const path = el.dataset.path;
      const value = el.type === "number" ? Number(el.value) : el.value;
      store.patch(path, value);
    });
  });

  // +/- für Zeiten (±15 Min)
  root.querySelectorAll('[data-action="stepTime"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const path = btn.dataset.path;
      const delta = Number(btn.dataset.delta || 0);
      const current = getByPath(store.state, path) || "00:00";
      const min = clamp(timeToMin(current) + delta, 0, 1439);
      store.patch(path, minToTime(min));
    });
  });

  // +/- für Zahlen (±1 Min)
  root.querySelectorAll('[data-action="stepNumber"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const path = btn.dataset.path;
      const delta = Number(btn.dataset.delta || 0);
      const minValue = Number(btn.dataset.min ?? 0);
      const current = Number(getByPath(store.state, path) ?? 0);
      const next = Math.max(minValue, current + delta);
      store.patch(path, next);
    });
  });
};

function iconButtonEmbedded({ side, action, path, delta, min, label, icon }) {
  const base =
    "absolute top-1/2 -translate-y-1/2 " +
    "h-9 w-9 rounded-lg border border-slate-200 bg-white/90 " +
    "hover:bg-slate-50 active:scale-[0.98] " +
    "inline-flex items-center justify-center " +
    "transition shadow-sm shadow-slate-100";

  const pos = side === "left" ? "left-1" : "right-1";
  const dataMin = (min !== undefined) ? `data-min="${min}"` : "";

  return `
    <button type="button"
      aria-label="${escapeHtml(label)}"
      title="${escapeHtml(label)}"
      data-action="${action}"
      data-path="${path}"
      data-delta="${delta}"
      ${dataMin}
      class="${base} ${pos}">
      ${icon === "plus" ? plusIcon() : minusIcon()}
    </button>
  `;
}

// Standard Icon-Button (für Spielzeit/Pause außerhalb)
function iconButton({ action, path, delta, min, label, icon }) {
  const common =
    "h-10 w-10 rounded-xl border border-slate-200 bg-white " +
    "hover:bg-slate-50 active:scale-[0.98] " +
    "shadow-sm shadow-slate-100 " +
    "inline-flex items-center justify-center " +
    "transition";

  const dataMin = (min !== undefined) ? `data-min="${min}"` : "";

  return `
    <button type="button"
      aria-label="${escapeHtml(label)}"
      title="${escapeHtml(label)}"
      data-action="${action}"
      data-path="${path}"
      data-delta="${delta}"
      ${dataMin}
      class="${common}">
      ${icon === "plus" ? plusIcon() : minusIcon()}
    </button>
  `;
}

function plusIcon() {
  return `
    <svg viewBox="0 0 24 24" class="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 5v14"></path>
      <path d="M5 12h14"></path>
    </svg>
  `;
}

function minusIcon() {
  return `
    <svg viewBox="0 0 24 24" class="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 12h14"></path>
    </svg>
  `;
}

function alertIcon() {
  return `
    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <path d="M12 9v4"></path>
      <path d="M12 17h.01"></path>
    </svg>
  `;
}

function safeTimeToMin(t) {
  try {
    const m = timeToMin(t);
    return Number.isFinite(m) ? m : NaN;
  } catch {
    return NaN;
  }
}

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}