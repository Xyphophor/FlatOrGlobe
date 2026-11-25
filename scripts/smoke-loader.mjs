// Hook de chargement Node (pas Vite) pour scripts/mount-smoke.mjs : les
// imports CSS colocalisés deviennent des modules vides, et les JSON
// s'importent sans attribut `with`. Enregistré par smoke-register.mjs.
export async function load(url, context, next) {
  if (url.endsWith(".css")) return { format: "module", source: "export default {};", shortCircuit: true };
  if (url.endsWith(".json")) {
    const { readFileSync } = await import("node:fs");
    const { fileURLToPath } = await import("node:url");
    return { format: "module", source: "export default " + readFileSync(fileURLToPath(url), "utf8") + ";", shortCircuit: true };
  }
  return next(url, context);
}
