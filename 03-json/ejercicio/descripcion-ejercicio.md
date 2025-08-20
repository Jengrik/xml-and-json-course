# Ejercicio Avanzado: Del Dominio al JSON Schema y Validación con AJV

**Objetivo:** Diseñar un **JSON Schema** más complejo a partir de un dominio empresarial, producir un **JSON** válido y validar ambos con un **script genérico** basado en AJV.

---

## 1) Contexto de negocio

**Dominio:** Plataforma B2C de **logística y e‑commerce** que opera en varios países.  
**Caso:** El microservicio de **Órdenes** recibe **Purchase Orders (PO)** desde múltiples **canales** (web B2C, marketplace, API partners). Cada orden puede incluir **ítems simples** y **bundles** (paquetes con varios productos), distintos **métodos de pago**, **impuestos**, **descuentos** y **envíos** con **SLA** específicos por país.

**Problema actual:** Órdenes mal formadas llegan a Facturación y WMS generando rechazos, reprocesos y costos. Se requiere un **contrato de datos robusto** que bloquee estructuras inválidas antes de encolar la orden.

---

## 2) Requisitos Funcionales (RF)

- **RF1.** La **Purchase Order** debe contener: `id`, `createdAt`, `channel`, `buyer`, `lineItems`, `currency`, `payments`, `shipping`, `amounts`.
- **RF2.** `buyer` incluye: `id`, `name`, `email` (opcional), `taxId` (opcional, depende del país), `addresses` (domicilios), al menos 1 de tipo `billing` o `shipping`.
- **RF3.** `lineItems` admite **ítems simples** y **bundles**:
  - Ítem simple: `sku`, `description`, `quantity`, `unitPrice`, `taxRate`.
  - Bundle: `bundleId`, `items` (array de ítems simples), `bundlePrice` (opcional si hay prorrateo).
- **RF4.** `currency` debe ser ISO‑4217 (use un subconjunto razonable para el ejercicio).
- **RF5.** `payments` permite múltiples métodos: `card`, `pix`, `wire`, `cash`. Cada método tiene **campos específicos**.
- **RF6.** `shipping` contiene `method`, `shipTo` (address), `sla` (horas), `cost`, `carrier` (opcional por país).
- **RF7.** `amounts` agrega `subtotal`, `discounts` (opcional), `taxes`, `shipping`, `grandTotal`.
- **RF8.** La API debe **rechazar** propiedades desconocidas en cualquier objeto anidado.

---

## 3) Reglas de Negocio (RN)

- **RN1.** `id` sigue patrón `^PO-[A-Z0-9]{8}$`.
- **RN2.** `createdAt` en ISO‑8601 fecha‑hora `YYYY-MM-DDTHH:mm:ssZ` (UTC).
- **RN3.** `channel` ∈ {`web`, `marketplace`, `partner_api`}.
- **RN4.** `lineItems` tiene **al menos 1** elemento. Permitir **dos variantes** mutuamente excluyentes: **simple** *o* **bundle** (use `oneOf` o `anyOf`).
- **RN5.** Ítem simple: `quantity` entero **≥ 1**, `unitPrice` **≥ 0**, `taxRate` entre `0` y `1` (inclusive).
- **RN6.** Bundle: `items` con **min 2** ítems simples; si existe `bundlePrice`, debe ser **≥ 0**.
- **RN7.** `payments` admite **uno o más** pagos.  
  - `card`: requiere `bin` (6 dígitos), `last4` (4 dígitos), `authCode` (alfa 6–12).  
  - `pix`: requiere `endToEndId` (patrón alfanumérico), `bank` (string).  
  - `wire`: requiere `swift` (patrón SWIFT básico), `reference`.  
  - `cash`: requiere `receivedBy` (string).
  Use `oneOf` por tipo y `discriminator` (opcional) vía campo `method`.
- **RN8.** `shipping.sla` entero **≥ 2** horas. `shipTo.country` ∈ {`CO`, `BR`, `MX`, `US`, `CA`}.  
- **RN9.** `amounts.subtotal`, `amounts.taxes`, `amounts.shipping`, `amounts.grandTotal` **≥ 0**. `discounts` (si existe) **≤ subtotal**.
- **RN10.** `buyer.email` si existe, debe validar formato `email`.  
- **RN11.** `addresses[*].type` ∈ {`billing`, `shipping`}; `postalCode` con **patrón por país** (defina un patrón genérico para el ejercicio).  
- **RN12.** **No se admiten** propiedades adicionales (`additionalProperties: false`) en todos los objetos.

---

## 4) Criterios de aceptación

- El **schema**:  
  - Usa **$defs/$ref** para evitar duplicación.  
  - Aplica `oneOf` / `anyOf` correctamente para variantes.  
  - Restringe fuertemente con `required`, `enum`, `pattern`, `minimum`, `minItems`.  
  - Define `additionalProperties: false` en todos los objetos.  
- El **JSON**:  
  - Cumple el schema y representa el **caso de negocio completo** (bundles, métodos de pago, shipping con SLA, addresses).  
  - Incluye campos opcionales de forma coherente (p. ej., `buyer.email`).  
- La **validación** con AJV:  
  - Evidencia ejecuciones válidas e inválidas y muestra comprensión de los mensajes de error.

---

## 5) Casos de prueba sugeridos (romper y reparar)

- `id` con patrón incorrecto (`PO-ABC` en lugar de `PO-XXXXXXXX`).  
- `createdAt` sin zona UTC o formato no ISO‑8601.  
- `lineItems` con mezcla inválida de campos de bundle y simple simultáneamente.  
- `payments` con `method: "card"` sin `bin` o `last4`.  
- `shipping.sla` < 2.  
- Propiedad inesperada en cualquier objeto (`foo`: 123).  
- `discounts` mayor que `subtotal` (marcar en comentarios que esta validación final es lógica de dominio).

---

## 6) Reflexión

1. ¿Qué ventajas ofrece el uso de `$defs` + `$ref` en mantenibilidad y reutilización?  
2. ¿Cuándo usar `oneOf` vs `anyOf` en este dominio?  
3. ¿Qué validaciones conviene mantener en **schema** y cuáles en **dominio**?  
4. ¿Cómo versionaría estos esquemas para múltiples partners y países?
