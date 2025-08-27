# Sesión 6 — Bloque 1: Parseo de XML en Node.js (Ejercicios con contexto)

> **Curso:** XML y JSON  
> **Sesión 6:** Procesamiento de XML y JSON con JavaScript  
> **Bloque 1:** Parseo de XML en Node.js  
> **Modalidad:** Laboratorio intensivo (Node.js + ESM)  
> **Duración sugerida:** 70–90 min (puede extenderse con los extras)

---

## 🎯 Objetivos de aprendizaje
Al finalizar este bloque, el estudiante será capaz de:
- Parsear XML a **objetos JavaScript** usando `xml2js` (y comparar con alternativas como SAX).
- **Normalizar** atributos, texto y tipos (number/boolean), respetando una convención de salida estable.
- Gestionar **namespaces**, **CDATA** y diferencias “uno vs muchos” (array vs singular).
- Implementar un pipeline básico de **transformación funcional** separando I/O de lógica de negocio.
- Procesar **archivos grandes en streaming** con `sax` cuando el DOM completo no es viable.
- Realizar un **round‑trip** (JSON → XML) para interoperabilidad con terceros.

---

## 📦 Prerrequisitos y setup

- **Node.js 18+** (ESM). En tu `package.json` agrega `"type": "module"`.
- Crea un proyecto vacío y realiza la instalación base:

```bash
mkdir s06-bloque1 && cd s06-bloque1
npm init -y
npm i xml2js sax
# (opcional para comparación de performance/ergonomía)
npm i fast-xml-parser
```

Estructura sugerida de carpetas:
```
s06-bloque1/
├─ data/
│  ├─ catalogo.xml
│  ├─ catalogo-ns.xml
│  └─ catalogo-grande.xml        # generado, ver script en Ejercicio 4
├─ src/
│  ├─ parse-catalogo-basic.mjs   # Ejercicio 1 (versión base)
│  ├─ parse-catalogo-normalized.mjs
│  ├─ transform.js               # funciones puras de transformación
│  ├─ sanitize.js                # utilidades de sanitización de texto
│  ├─ parse-with-namespaces.mjs  # Ejercicio 3
│  ├─ generate-large-xml.mjs     # util para crear catalogo-grande.xml
│  └─ count-streaming.mjs        # Ejercicio 4
└─ package.json
```

---

## 🗂️ Datos de ejemplo (pegar en `data/`)

### `data/catalogo.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalogo xmlns:cat="http://example.com/catalog">
  <producto id="P001" categoria="Ropa">
    <nombre>Camiseta Deportiva</nombre>
    <precio moneda="USD">29.99</precio>
    <stock>120</stock>
    <descripcion><![CDATA[ Tejido <fresco> y cómodo ]]></descripcion>
  </producto>
  <producto id="P002" categoria="Electrónica">
    <nombre>Audífonos Inalámbricos</nombre>
    <precio moneda="USD">89.50</precio>
    <stock>45</stock>
  </producto>
  <producto id="P003" categoria="Ropa">
    <nombre>Pantalón Training</nombre>
    <precio moneda="USD">52.00</precio>
    <stock>0</stock>
  </producto>
</catalogo>
```

### `data/catalogo-ns.xml` (con prefijos/namespace explícitos)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<cat:catalogo xmlns:cat="http://example.com/catalog">
  <cat:producto id="P010" cat:categoria="Electrónica">
    <cat:nombre>Smartwatch</cat:nombre>
    <cat:precio moneda="USD">120.00</cat:precio>
    <cat:stock>30</cat:stock>
  </cat:producto>
  <cat:producto id="P011" cat:categoria="Ropa">
    <cat:nombre>Chaqueta Impermeable</cat:nombre>
    <cat:precio moneda="USD">75.00</cat:precio>
    <cat:stock>14</cat:stock>
  </cat:producto>
</cat:catalogo>
```

> **Nota:** `data/catalogo-grande.xml` se generará en el **Ejercicio 4** con un script para simular big data.

---

## 🧪 Ejercicio 1 — Extracción básica y normalización

**Contexto:** La tienda universitaria publica su catálogo como `catalogo.xml`. El área de analítica necesita un **array uniforme** de productos con tipos correctos para ejecutar filtros y agregaciones.

### Tareas
1. Parsear `catalogo.xml` con **`xml2js`** usando una configuración *ergonómica*:
   - `explicitArray: false` (para elementos singulares).
   - `trim: true` (limpia espacios extremos).
   - `valueProcessors: [processors.parseNumbers, processors.parseBooleans]` (tipado num/boolean).
   - `tagNameProcessors: [processors.stripPrefix]` (quita prefijos de namespace en nombres de tag).
   - `explicitRoot: false` (opcional, si quieres el contenido de `catalogo` directo).
2. Estandarizar un **modelo interno** (Clean Code) en `src/transform.js`:
   ```ts
   export type Product = {
     id: string;
     category: string;
     name: string;
     price: number;
     currency: string;
     stock: number;
     description: string | null;
   };
   ```
3. Mapear el objeto parseado a `Product[]`, respetando:
   - Atributos bajo `$.` (o fusionados si decides `mergeAttrs: true`, pero **documenta** la convención).
   - Texto de nodos bajo `_` cuando aplique (p. ej., `<precio>` con atributo `moneda`).
4. Filtrar productos con `price > 50` y `stock >= 10`.
5. Calcular métricas: `count`, `avgPrice`, `maxPrice`, `minPrice` y mostrarlas en consola.

### Boilerplate sugerido
`src/parse-catalogo-normalized.mjs`
```js
import { readFile } from "node:fs/promises";
import { Parser, processors } from "xml2js";
import { toProductList } from "./transform.js";

const xml = await readFile("./data/catalogo.xml", "utf-8");

const parser = new Parser({
  explicitArray: false,
  trim: true,
  explicitRoot: false,
  valueProcessors: [processors.parseNumbers, processors.parseBooleans],
  tagNameProcessors: [processors.stripPrefix]
});

const root = await parser.parseStringPromise(xml);
const products = toProductList(root);

const filtered = products.filter(p => p.price > 50 && p.stock >= 10);

const prices = filtered.map(p => p.price);
const count = filtered.length;
const avg = count ? prices.reduce((a, b) => a + b, 0) / count : 0;
const max = count ? Math.max(...prices) : 0;
const min = count ? Math.min(...prices) : 0;

console.log({ count, avgPrice: Number(avg.toFixed(2)), maxPrice: max, minPrice: min });
```

`src/transform.js`
```js
// Funciones puras de transformación (fácil de testear)
export function toProductList(root) {
  const productos = Array.isArray(root.producto) ? root.producto : [root.producto];
  return productos.map(p => ({
    id: p.$.id,
    category: p.$.categoria,            // o p['cat:categoria'] si mantienes prefijos
    name: p.nombre,
    price: Number(p.precio._ ?? p.precio),
    currency: p.precio.$?.moneda ?? "USD",
    stock: Number(p.stock),
    description: p.descripcion ?? null
  }));
}
```

### Criterios de aceptación
- El script imprime un objeto con métricas coherentes (valores numéricos).
- `Product[]` mantiene **nombres claros** y **tipos correctos**.
- Se documenta en comentarios la convención elegida (`$`, `_`, namespaces).

### Extensión (opcional)
- Exporta `Product[]` a `data/catalogo.json` para reuso posterior.
- Añade pruebas unitarias para `toProductList()` con **fixtures** variados.

---

## 🧪 Ejercicio 2 — Atributos y CDATA (descripciones enriquecidas)

**Contexto:** Marketing inserta descripciones con HTML embebido en `<![CDATA[ ... ]]>`. Algunos productos no tienen descripción. El equipo de canales pide una versión “plaintext” (sin tags) para notificaciones SMS.

### Tareas
1. Asegurar que el parseo preserve el **contenido literal** de `descripcion` (sin escapar).
2. Implementar en `src/sanitize.js` una función `toPlainText(htmlLikeString)` que:
   - Elimine etiquetas HTML (puede ser una aproximación simple con regex).
   - Colapse espacios en blanco redundantes.
3. En un script (`src/parse-catalogo-normalized.mjs` o aparte), imprimir para los primeros 5 productos:
   - `id`, `rawDescription.length`, `plainDescription.length`.

### Ejemplo de utilidad sencilla
`src/sanitize.js`
```js
export function toPlainText(input) {
  if (!input) return "";
  // ⚠️ Aproximación simple: no cubre 100% de casos HTML complejos
  const withoutTags = String(input).replace(/<[^>]*>/g, " ");
  return withoutTags.replace(/\s+/g, " ").trim();
}
```

### Criterios de aceptación
- Los productos sin descripción resultan en `description: null` y `plainDescription: ""`.
- Las longitudes reportadas son consistentes con la limpieza aplicada.
- Se comenta en el código que para producción se recomienda una librería robusta de sanitización.

### Extensión (opcional)
- Implementar una versión “resumida” con límite de 140 caracteres para SMS.
- Guardar un CSV con columnas `id,name,plainDescriptionLength`.

---

## 🧪 Ejercicio 3 — Namespaces y filtrado por categoría

**Contexto:** Un proveedor migra su XML para usar prefijos y namespaces (`catalogo-ns.xml`). Debes **conservar** información de namespace y filtrar productos por categoría `Electrónica`.

### Tareas
1. Parsear `data/catalogo-ns.xml` con `xml2js` usando:
   - `xmlns: true` (conserva datos de namespace por nodo/atributo).
   - **No** usar `stripPrefix` (queremos ver los prefijos).
2. Inspeccionar el resultado y documentar **cómo** se representan:
   - Nombres calificados (p. ej., `cat:producto`).
   - Atributos con namespace (`cat:categoria`).
3. Implementar un filtro que seleccione productos con `cat:categoria="Electrónica"` y muestre `{ id, name }`.

### Boilerplate sugerido
`src/parse-with-namespaces.mjs`
```js
import { readFile } from "node:fs/promises";
import { Parser } from "xml2js";

const xml = await readFile("./data/catalogo-ns.xml", "utf-8");

const parser = new Parser({
  explicitArray: false,
  trim: true,
  explicitRoot: false,
  xmlns: true
});

const root = await parser.parseStringPromise(xml);
// Observa la forma: root["cat:catalogo"]["cat:producto"] ...
const productos = root["cat:catalogo"]["cat:producto"];
const arr = Array.isArray(productos) ? productos : [productos];

const out = arr
  .filter(p => p.$["cat:categoria"] === "Electrónica")
  .map(p => ({ id: p.$.id, name: p["cat:nombre"] }));

console.log(out);
```

### Criterios de aceptación
- Se visualiza en consola la estructura con namespaces.
- El filtro por categoría devuelve al menos un elemento correcto.
- El script contiene comentarios explicando la decisión sobre conservar prefijos vs simplificarlos.

### Extensión (opcional)
- Repetir el ejercicio usando `tagNameProcessors: [processors.stripPrefix]` y comparar ergonomía vs fidelidad.

---

## 🧪 Ejercicio 4 — Streaming con `sax` para grandes volúmenes

**Contexto:** Llega un archivo **muy grande** (`catalogo-grande.xml`, ~1.5GB) que no cabe en memoria. Debes contar los `<producto>` con `stock > 0` y calcular el **precio promedio**, procesando en streaming.

### Paso 0 — Generar un XML grande (sintético)
`src/generate-large-xml.mjs`
```js
import { createWriteStream } from "node:fs";

const out = createWriteStream("./data/catalogo-grande.xml", "utf-8");
const N = 500_000; // ajusta según tu máquina

out.write('<?xml version="1.0" encoding="UTF-8"?>\n<catalogo>\n');
for (let i = 1; i <= N; i++) {
  const price = (Math.random() * 100 + 10).toFixed(2);
  const stock = Math.random() < 0.7 ? Math.floor(Math.random() * 200) : 0;
  out.write(
    `  <producto id="PX${i}" categoria="${stock > 0 ? "Ropa" : "Electrónica"}">\n` +
    `    <nombre>Item ${i}</nombre>\n` +
    `    <precio moneda="USD">${price}</precio>\n` +
    `    <stock>${stock}</stock>\n` +
    `  </producto>\n`
  );
}
out.write("</catalogo>\n");
out.end();
console.log("OK: data/catalogo-grande.xml generado");
```

Ejecuta:
```bash
node src/generate-large-xml.mjs
```

### Tareas (streaming)
1. Implementar `src/count-streaming.mjs` con `sax`:
   - Parsear **en streaming** y mantener solo contadores/estadísticos.
   - **No** construir un objeto completo en memoria.
2. Reportar `{ count, avgPrice }` de productos con `stock > 0`.

### Boilerplate sugerido
`src/count-streaming.mjs`
```js
import sax from "sax";
import { createReadStream } from "node:fs";

const saxStream = sax.createStream(true, { trim: true });

let currentTag = null;
let inProducto = false;
let stock = 0;
let price = 0;
let count = 0;
let totalPrice = 0;

saxStream.on("opentag", node => {
  currentTag = node.name;
  if (currentTag === "producto") {
    inProducto = true;
    stock = 0;
    price = 0;
  }
});

saxStream.on("text", t => {
  if (!inProducto) return;
  if (currentTag === "stock") stock = Number(t);
  if (currentTag === "precio") price = Number(t);
});

saxStream.on("closetag", name => {
  if (name === "producto") {
    if (stock > 0) {
      count++;
      totalPrice += price;
    }
    inProducto = false;
  }
});

saxStream.on("end", () => {
  const avg = count ? totalPrice / count : 0;
  console.log({ count, avgPrice: Number(avg.toFixed(2)) });
});

createReadStream("./data/catalogo-grande.xml").pipe(saxStream);
```

### Criterios de aceptación
- El script procesa el archivo sin errores de memoria.
- La salida muestra `{ count, avgPrice }` coherentes con el dataset.
- El código comenta brevemente por qué **streaming** es la opción adecuada.

### Extensión (opcional)
- Añadir medición de tiempo y MB procesados/segundo.
- Contar también por **categoría** y mostrar promedios por grupo.

---

## 🧪 Ejercicio 5 — Round‑trip (JSON → XML) con `xml2js` Builder

**Contexto:** Tras limpiar y normalizar `Product[]`, un tercero requiere recibir un **XML** con un formato simple y bien formado.

### Tareas
1. Partiendo de `Product[]` (de Ejercicio 1), construir un XML con:
   - Raíz `<catalogo>`.
   - Múltiples `<producto>` con atributos `id` y `categoria`.
   - Elementos `nombre`, `precio` (con atributo `moneda`) y `stock`.
2. Incluir la declaración: `<?xml version="1.0" encoding="UTF-8"?>`.
3. Guardar el resultado como `data/catalogo-export.xml`.

### Boilerplate sugerido
`src/build-xml.mjs`
```js
import { writeFile, readFile } from "node:fs/promises";
import { Builder } from "xml2js";

// Suponiendo que guardaste Product[] previamente en data/catalogo.json
const productsJson = JSON.parse(await readFile("./data/catalogo.json", "utf-8"));

const builder = new Builder({
  headless: false,
  xmldec: { version: "1.0", encoding: "UTF-8" }
});

const catalog = {
  catalogo: {
    producto: productsJson.map(p => ({
      $: { id: p.id, categoria: p.category },
      nombre: p.name,
      precio: [{ _: String(p.price), $: { moneda: p.currency } }],
      stock: String(p.stock)
    }))
  }
};

const xml = builder.buildObject(catalog);
await writeFile("./data/catalogo-export.xml", xml, "utf-8");
console.log("OK: data/catalogo-export.xml generado");
```

### Criterios de aceptación
- El XML exportado es **bien formado** y se puede abrir en un editor/validador.
- La estructura mantiene atributos y elementos según lo solicitado.
- Se documentan decisiones: por qué `precio` se representa con `_` (texto) + `$` (atributos).

### Extensión (opcional)
- Añadir opción para **incluir CDATA** en `descripcion` si existe.
- Parametrizar `moneda` y permitir exportar en `EUR`/`USD`.

---

## ✅ Checklist de evaluación (para el instructor)
- [ ] Control del caso **array vs singular** al parsear.
- [ ] **Coerción de tipos** implementada (número/boolean).
- [ ] Transformación **pura** separada de I/O (módulo `transform.js`).
- [ ] Gestión de **CDATA** y sanitización explicada/documentada.
- [ ] Prueba con **namespaces**: conserva/inspecciona y filtra correctamente.
- [ ] Procesamiento **streaming** sin OOM con `sax`.
- [ ] Exportación (round‑trip) a XML **bien formado**.

---

## 💡 Tips profesionales (resumen)
- Decide y **documenta** tu convención de salida (`$` para atributos, `_` para texto; namespaces con/ sin prefijo).
- Para **grandes volúmenes**, usa streaming (SAX) y métricas (tiempo/MB/s).
- Mantén funciones puras para facilitar **testing** y **reusabilidad**.
- Considera riesgos de **XXE**: evita DTD/entidades externas; trabaja en modo `strict`.
- Prepara **fixtures variados** (sin descripción, múltiples precios, con namespace) para robustecer tu pipeline.
```

