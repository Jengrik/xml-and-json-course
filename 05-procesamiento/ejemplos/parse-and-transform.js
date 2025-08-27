// parse-and-transform.mjs (orquestación)
import { readFile } from "node:fs/promises";
import { Parser, processors } from "xml2js";
import { toProductList } from "./transform.js";

const xml = await readFile("05-procesamiento/ejemplos/catalogo.xml", "utf-8");
const parser = new Parser({
  explicitArray: false,
  trim: true,
  explicitRoot: false,
  tagNameProcessors: [processors.stripPrefix],
  valueProcessors: [processors.parseNumbers, processors.parseBooleans]
});

const root = await parser.parseStringPromise(xml);
const products = toProductList(root);
console.log(products.length, "productos parseados");
console.log(products);
