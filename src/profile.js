import profile from "../profile.json";
const params = new URLSearchParams(location.search);
if (!params.has("username")) {
  params.set("username", profile.username);
  history.replaceState(null, "", location.pathname + "?" + params + location.hash);
}
window.gitskinsFolioData = profile;
document.documentElement.dataset.personalizationSafe = "true";
