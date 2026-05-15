import { store } from "./store.js";
import { getRoute, onRouteChange } from "./router.js";
import { Layout, bindLayoutEvents } from "./components/layout.js";

import { SettingsPage } from "./features/settings.js";
import { RegistrationPage } from "./features/registration.js";
import { SchedulePage } from "./features/schedule.js";
import { PrintPage } from "./features/print.js";

// Veranstalter-Liste
import { organizers } from "./data/organizers.sample.js";
// NEU: Austragungsorte-Liste
import { venues } from "./data/venues.sample.js";

store.hydrateFromLocalStorage();

// Initialdaten: Veranstalter setzen, falls noch keine vorhanden
if (!Array.isArray(store.state.organizers) || store.state.organizers.length === 0) {
  const next = structuredClone(store.state);
  next.organizers = organizers;

  if (!next.tournament.organizerId && organizers.length > 0) {
    next.tournament.organizerId = organizers[0].id;
  }
  store.setState(next);
}

// NEU: Austragungsorte setzen, falls noch keine vorhanden
if (!Array.isArray(store.state.venues) || store.state.venues.length === 0) {
  const next = structuredClone(store.state);
  next.venues = venues;

  if (!next.tournament.venueId && venues.length > 0) {
    next.tournament.venueId = venues[0].id;
  }

  store.setState(next);
}

const app = document.getElementById("app");

function render() {
  const route = getRoute();
  let content = "";

  if (route === "settings") content = SettingsPage(store.state);
  if (route === "registration") content = RegistrationPage(store.state);
  if (route === "schedule") content = SchedulePage(store.state);
  if (route === "print") content = PrintPage(store.state);

  app.innerHTML = Layout({ route, content });
  bindLayoutEvents(app);

  window.__bindPage?.(route, app, store);
}

store.subscribe(render);
onRouteChange(render);
render();