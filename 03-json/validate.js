//* LiveCoding: Validación de JSON contra JSON Schema con AJV

// Imports
const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

// Paths relativos
const SCHEMA_PATH = path.join(__dirname, "ejemplo", "invoice.schema.json");
const DATA_PATH = path.join(__dirname, "ejemplo", "invoice.json");



// Cargar archivos JSON
const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf-8"));
const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

// Configurar AJV
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Validación
const validate = ajv.compile(schema);
const valid = validate(data);

// Resultado
if (valid) {
  console.log("JSON válido según el esquema :)");
} else {
  console.error("JSON inválido :c . Errores:");
  console.error(validate.errors);
}
