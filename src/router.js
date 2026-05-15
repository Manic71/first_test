export function getRoute() {
  const hash = location.hash.replace("#", "");
  return hash || "settings";
}

export function navigate(route) {
  location.hash = route;
}

export function onRouteChange(cb) {
  window.addEventListener("hashchange", () => cb(getRoute()));
}