# Ejercicio Propuesto: Sistema de Pedidos en Línea

## Contexto de Negocio
Una empresa de comercio electrónico necesita intercambiar información sobre **pedidos de clientes** en formato XML.  
Cada pedido incluye información del cliente, la lista de productos comprados y los totales del pedido.  
El sistema consumidor debe validar que el XML sea **bien formado** y **válido contra un XSD**.

---

## Requisitos Funcionales (RF)
- **RF-1:** El documento debe tener un único elemento raíz `<pedido>`.  
- **RF-2:** `<pedido>` incluye obligatoriamente:
  - Elemento `<cliente>` con:
    - `<nombre>` (string obligatorio).  
    - `<email>` (string con formato email, validado por patrón).  
  - Elemento `<items>` con uno o más `<item>`.  
  - Elemento `<total>` (decimal ≥ 0).  
- **RF-3:** Cada `<item>` debe tener:
  - Atributo `codigo` obligatorio (patrón: `I\d{4}`).  
  - Sub-elementos:
    - `<descripcion>` (string no vacío).  
    - `<cantidad>` (entero positivo).  
    - `<precioUnitario>` (decimal positivo).  
- **RF-4:** El valor de `<total>` debe ser **la suma de (cantidad × precioUnitario) de todos los ítems**.  
- **RF-5:** El XML debe declarar `xsi:noNamespaceSchemaLocation="pedido.xsd"` para su validación.

---

## Reglas de Negocio (RN)
- **RN-1:** El `codigo` de un ítem identifica de forma única un producto.  
- **RN-2:** `<cantidad>` ≥ 1.  
- **RN-3:** `<precioUnitario>` ≥ 0.01.  
- **RN-4:** `<total>` debe ser consistente con el detalle (regla de negocio, no validada directamente por XSD).  
- **RN-5:** El `<email>` debe ajustarse a un patrón básico de dirección válida.  

---

## Diccionario de Datos (extracto)

| Elemento/Atributo   | Tipo lógico         | Obligatorio | Restricciones                  |
|---------------------|--------------------|-------------|--------------------------------|
| `pedido` (root)     | contenedor         | Sí          | 1 por documento                |
| `cliente/nombre`    | string             | Sí          | No vacío                       |
| `cliente/email`     | string (email)     | Sí          | Patrón simple de email         |
| `items/item`        | contenedor         | 1..n        | Colección de ítems             |
| `@codigo` (item)    | string             | Sí          | Patrón `I\d{4}`               |
| `descripcion`       | string             | Sí          | Texto no vacío                 |
| `cantidad`          | positiveInteger    | Sí          | ≥ 1                            |
| `precioUnitario`    | decimal            | Sí          | ≥ 0.01                         |
| `total`             | decimal            | Sí          | ≥ 0                            |
