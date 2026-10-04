// Familles de pages interactives partageant le même contrat de socle.
// Les préfixes d'URL restent distincts : cette classification sert uniquement aux règles transversales.
export const INTERACTIVE_FAMILIES = Object.freeze(["outil","conversion","comparateur"]);

const FAMILY_RE = new RegExp("^(?:" + INTERACTIVE_FAMILIES.join("|") + ")/([^/]+)/index\\.html$");

export function getInteractiveFamily(relativePath) {
  const normalized = String(relativePath).replaceAll("\\","/");
  const match = FAMILY_RE.exec(normalized);
  return match ? normalized.slice(0, normalized.indexOf("/")) : null;
}

export function isInteractivePage(relativePath) {
  return getInteractiveFamily(relativePath) !== null;
}
