# LiveCoding: Del Dominio al JSON Schema y Validación Genérica con AJV

**Objetivo:**

1.  Levantar **requisitos** a partir del **contexto de negocio**.\
2.  Derivar un **JSON Schema** a partir de RF/RN.\
3.  Crear un **JSON** conforme a ese esquema.\
4.  Validar **cualquier** JSON contra **cualquier** Schema usando un
    **validador genérico con AJV**.

------------------------------------------------------------------------

## 1) Contexto de negocio

**Dominio:** E‑commerce B2C de retail tecnológico.\
**Caso:** El microservicio de **Facturación** recibe **Invoices** desde
**Checkout** y debe validar su estructura antes de generar el
comprobante fiscal y enviar eventos a Contabilidad.

------------------------------------------------------------------------

## 2) Requisitos Funcionales (RF)

-   **RF1.** El sistema debe recibir una **Invoice** con: `id`, `date`,
    `customer`, `items`, `currency`, `total`.\
-   **RF2.** `customer` debe incluir `id`, `name`, `email` (opcional),
    `taxId` (NIT).\
-   **RF3.** `items` es un **array** con al menos un ítem; cada ítem:
    `productId`, `description`, `quantity`, `unitPrice`.\
-   **RF4.** `currency` debe ser una moneda ISO‑4217 (p. ej., `USD`,
    `COP`).\
-   **RF5.** La API debe **rechazar** mensajes con propiedades
    inesperadas.

------------------------------------------------------------------------

## 3) Reglas de Negocio (RN)

-   **RN1.** `id` de factura sigue el patrón `^INV-\d{6}$` (p. ej.,
    `INV-012345`).\
-   **RN2.** `date` debe estar en formato ISO `YYYY-MM-DD`.\
-   **RN3.** `quantity` es **entero ≥ 1**; `unitPrice` es **number ≥
    0**.\
-   **RN4.** `total` debe ser **≥ 0**. (La verificación aritmética
    exacta se realiza en el servicio de dominio; el schema sólo valida
    tipos y mínimos).\
-   **RN5.** `customer.taxId` debe ajustarse a un patrón alfanumérico
    simple `^[A-Z0-9-]{5,20}$`.\
-   **RN6.** **No se admiten** propiedades no especificadas (→
    `additionalProperties: false`).\
-   **RN7.** `items[*].productId` cumple patrón `^P\d{3}$`.

> **Nota didáctica:** JSON Schema valida **estructura** y **tipos**;
> validaciones aritméticas y consistencia (p. ej.,
> `sum(items) == total`) se recomienda hacerlas en la **lógica de
> dominio**, no en el schema.


------------------------------------------------------------------------

## 4) Reflexión

-   ¿Qué ventajas ofrece JSON Schema frente a validaciones manuales en
    el código?\
-   ¿Qué problemas pueden surgir si no validamos un JSON antes de usarlo
    en un proceso crítico?\
-   ¿Qué validaciones corresponden al **schema** y cuáles deben quedar
    en la **lógica de negocio**?
