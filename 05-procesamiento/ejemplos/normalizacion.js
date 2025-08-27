// parse-catalogo-normalized.mjs
import { readFile } from "node:fs/promises";
import { Parser, processors } from "xml2js";

const xml = await readFile("05-procesamiento/ejemplos/catalogo.xml", "utf-8");

// Value processors: coercion a número/boolean cuando aplica
const parser = new Parser({
  explicitArray: false, // campos singulares como string/objeto
  trim: true,
  explicitRoot: false,  // quita la raíz “catalogo” si no la necesitas
  mergeAttrs: false,    // mantenemos atributos separados en "$" (más claro)
  tagNameProcessors: [processors.stripPrefix], // quita prefijos de namespace
  valueProcessors: [processors.parseNumbers, processors.parseBooleans]
});

const root = await parser.parseStringPromise(xml);
// root.producto es un array porque hay múltiples <producto>, aunque explicitArray=false
const productos = Array.isArray(root.producto) ? root.producto : [root.producto];

// Transformación a un modelo interno estable:
const normalized = productos.map(p => ({
  id: p.$.id,
  category: p.$.categoria,
  name: p.nombre,                  // ya no es array
  price: Number(p.precio._ ?? p.precio), // coerción a número
  currency: p.precio.$?.moneda ?? "USD",
  stock: Number(p.stock),
  description: p.descripcion ?? null
}));

console.log(normalized);