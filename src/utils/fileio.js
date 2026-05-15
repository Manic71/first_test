export function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Erzeugt ein JS Modul: export const <varName> = <data>;
export function exportAsJsModule(varName, data) {
  const pretty = JSON.stringify(data, null, 2);
  return `export const ${varName} = ${pretty};\n`;
}

// Liest eine .js Datei und extrahiert export const <varName> = <JSON>;
export async function importJsModuleFile(file, expectedVarName) {
  const text = await file.text();

  const re = new RegExp(`export\\s+const\\s+${expectedVarName}\\s*=\\s*([\\s\\S]*?);\\s*$`);
  const match = text.match(re);
  if (!match) throw new Error(`Datei enthält kein "export const ${expectedVarName} = ...;"`);

  const jsonLike = match[1].trim();
  const data = JSON.parse(jsonLike);
  return data;
}