# Documento de Especificación: Catálogo de Productos (XML)

**Propósito:**  
Definir un contrato de intercambio de datos para un Catálogo de Productos entre el **Sistema Comercial** (emisor) y el **Sistema de Comercio Electrónico** (receptor).

---

## 1. Contexto de Negocio
- El catálogo de productos debe compartirse entre sistemas.  
- El emisor genera el archivo XML, el receptor lo valida contra un esquema (XSD).  
- Se busca interoperabilidad, calidad de datos y extensibilidad.  

---

## 2. Requisitos Funcionales (RF)
- **RF-1:** Un único elemento raíz `<catalogo>`.  
- **RF-2:** `<catalogo>` contiene cero o más `<producto>`.  
- **RF-3:** Para `<producto>`: Atributo **id** obligatorio con patrón `P\d{3}`.  
- **RF-4:** Para `<producto>`: Atributo **categoria** opcional.  
- **RF-5:** Elementos requeridos: `<nombre>`, `<precio>`, `<stock>`.  
- **RF-6:** Orden obligatorio: `nombre → precio → stock`.  
- **RF-7:** `<precio>` como decimal, `<stock>` como entero no negativo.  

---

## 3. Reglas de Negocio (RN)
- **RN-1:** `id` único por producto.  
- **RN-2:** `precio ≥ 0`.  
- **RN-3:** `stock ≥ 0`.  
- **RN-4:** `categoria` es opcional y breve.  
- **RN-5:** El root `<catalogo>` representa un conjunto vigente de productos.  
