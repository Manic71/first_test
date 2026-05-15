const listeners = new Set();

function normalizeState(loaded) {
  const s = loaded ?? {};

  // Ensure top-level keys
  s.tournament ??= {};
  s.venues ??= [];
  s.clubs ??= [];
  s.organizers ??= [];
  s.schedule ??= { byAgeGroup: {} };
  s.schedule.byAgeGroup ??= {};
  s.ui ??= { toast: null };

  // Tournament defaults (Turniername bewusst NICHT mehr)
  s.tournament.date ??= "";
  s.tournament.startTime ??= "09:00";
  s.tournament.endTime ??= "16:00";
  s.tournament.gameDurationMin ??= 10;
  s.tournament.breakMin ??= 2;
  s.tournament.ageGroups ??= ["U6", "U8", "U10"];
  s.tournament.fields ??= ["A", "B", "C"];
  s.tournament.venueId ??= "v1";
  s.tournament.organizerId ??= "";

  // Migration: falls alte Daten noch tournament.name enthalten -> entfernen
  if (Object.prototype.hasOwnProperty.call(s.tournament, "name")) {
    delete s.tournament.name;
  }

  return s;
}

export const store = {
  state: normalizeState({
    tournament: {
      date: "",
      startTime: "09:00",
      endTime: "16:00",
      gameDurationMin: 10,
      breakMin: 2,
      ageGroups: ["U6", "U8", "U10"],
      fields: ["A", "B", "C"],
      venueId: "v1",
      organizerId: "",
    },
    venues: [],
    clubs: [],
    organizers: [],
    schedule: { byAgeGroup: {} },
    ui: { toast: null }
  }),

  setState(nextState) {
    this.state = normalizeState(nextState);
    listeners.forEach(fn => fn(this.state));
    try {
      localStorage.setItem("tournament_app_state_v1", JSON.stringify(this.state));
    } catch {}
  },

  patch(path, value) {
    const keys = path.split(".");
    const next = structuredClone(this.state);
    let cur = next;
    for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
    cur[keys[keys.length - 1]] = value;
    this.setState(next);
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  hydrateFromLocalStorage() {
    try {
      const raw = localStorage.getItem("tournament_app_state_v1");
      if (!raw) return;
      this.state = normalizeState(JSON.parse(raw));
    } catch {}
  }
};