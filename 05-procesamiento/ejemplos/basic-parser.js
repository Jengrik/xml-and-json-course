// parse-catalogo-basic.mjs
import { readFile } from "node:fs/promises";
import { Parser } from "xml2js";

const xml = await readFile("05-procesamiento/ejemplos/catalogo.xml", "utf-8");

// Configuración “default-friendly” de xml2js.
// Nota: por defecto, xml2js mapea atributos en la clave "$" y texto en "_".
// explicitArray: true => siempre arrays (consistencia a costa de verbosidad).
const parser = new Parser({
  explicitArray: true,
  trim: true,
  normalize: false,
  normalizeTags: false,
  explicitCharkey: false, // usar "_" para text nodes
  explicitRoot: true,     // conservar nodo raíz en el resultado
  strict: true
});

const jsObj = await parser.parseStringPromise(xml);
console.dir(jsObj, { depth: null });
console.log(jsObj?.catalogo?.producto[0])
