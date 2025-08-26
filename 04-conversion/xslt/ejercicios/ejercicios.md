# Session 5 — Block 2: XSLT in Action • Exercises

**Course:** XML y JSON  
**Session:** 5 — Transformación y Consumo de Datos  
**Duración sugerida:** 50–60 minutos de trabajo guiado + 30–40 minutos de práctica autónoma  
**Formato:** Laboratorio con entregables por ejercicio

> **Propósito del bloque**  
> Dominar transformaciones XSLT para (a) presentación HTML, (b) filtrado/redacción en XML, (c) agrupación por categoría, y (d) selección correcta con namespaces. Practicarás XPath, plantillas (`match`), `apply-templates` vs `for-each`, `sort`, condicionales, variables, `key`, patrón de identidad y selección con namespaces.

---

## 🧰 Requisitos y entorno

Puedes utilizar cualquiera de las siguientes opciones para ejecutar XSLT (elige una):  

1) **xsltproc (libxslt)**  
```bash
xsltproc plantilla.xsl entrada.xml > salida.html
```

2) **Saxon HE (Java 8+)**  
```bash
java -jar saxon-he.jar -s:entrada.xml -xsl:plantilla.xsl -o:salida.xml
```

3) **Navegador (para demos XML→HTML)**  
Incluye una PI en el XML:
```xml
<?xml-stylesheet type="text/xsl" href="plantilla.xsl"?>
```
> Abre el XML en el navegador para ver el resultado.

---

## 📦 Datos de ejemplo (copia en `data/`)

### `catalogo.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalogo>
  <producto id="P001">
    <nombre>Laptop Pro 14</nombre>
    <precio moneda="USD">1599.99</precio>
    <stock>12</stock>
    <categoria>Tecnologia</categoria>
  </producto>
  <producto id="P002">
    <nombre>Mouse Inalambrico</nombre>
    <precio moneda="USD">24.90</precio>
    <stock>0</stock>
    <categoria>Accesorios</categoria>
  </producto>
  <producto id="P003">
    <nombre>Monitor 27</nombre>
    <precio moneda="USD">289.00</precio>
    <stock>7</stock>
    <categoria>Tecnologia</categoria>
  </producto>
  <producto id="P004">
    <nombre>Teclado Mecanico</nombre>
    <precio moneda="USD">119.90</precio>
    <stock>25</stock>
    <categoria>Accesorios</categoria>
  </producto>
</catalogo>
```

### `feed-atom.xml` (namespaces)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Noticias</title>
  <entry><title>Item A</title></entry>
  <entry><title>Item B</title></entry>
  <entry><title>Item C</title></entry>
</feed>
```

---

## ✅ Ejercicio 1 — Reporte HTML para e‑commerce (XML→HTML)

**Contexto**  
Marketing solicita una **tabla HTML** con el catálogo, ordenada por criterios de negocio y con marcado visual para items agotados. Este reporte se embeddeará en una intranet.

**Objetivo**  
Transformar `catalogo.xml` en una **tabla HTML** con formato, orden y condicionales.

**Requisitos funcionales**
- Columnas: **ID, Nombre, Categoría, Precio, Stock**.
- **Orden**: primero productos con `stock > 0` y **luego** los `stock = 0`. Dentro de cada grupo, ordenar por **precio ascendente**.
- **Formato de precio**: dos decimales, prefijo de moneda (`USD $123.45`).
- **Condición visual**: si `stock = 0`, mostrar “**Sin stock**” en rojo.

**Criterios de aceptación**
- Usar **al menos dos `xsl:sort`** (orden compuesto) o una estrategia equivalente (dos bloques secuenciales).
- Usar `format-number()` para el precio.
- Mantener un HTML válido y bien estructurado (tabla con `<thead>`/`<tbody>`).

**Sugerencia técnica (pistas)**
- Para el orden compuesto, puedes aplicar:
  ```xml
  <xsl:sort select="stock = 0" data-type="text" order="ascending"/>
  <xsl:sort select="number(precio)" data-type="number" order="ascending"/>
  ```
  (Los `false()`/`true()` se ordenan como texto si el motor no soporta boolean en `sort`).  
- Para resaltar “Sin stock”: `xsl:choose` sobre `number(stock)`.

**Ejecución (ejemplo con xsltproc)**
```bash
cd ejercicios/e1-html
xsltproc e1.xsl ../../data/catalago.xml > e1.html
# Nota: verifica la ruta correcta y que el archivo se llame 'catalogo.xml'
```

**Entrega**
- `ejercicios/e1-html/e1.xsl`
- `ejercicios/e1-html/e1.html`
- Captura de pantalla del HTML en navegador (opcional).

---

## 🧾 Ejercicio 2 — XML filtrado para cumplimiento (Identidad + overrides)

**Contexto**  
Auditoría exige **suprimir** productos que **no** pertenezcan a la categoría “Tecnologia”, **redactar** los precios **> 1000** y **renombrar** el elemento raíz por `catalogo_auditoria`.

**Objetivo**  
Aplicar el **patrón de identidad** con **overrides** para filtrar y redactar, manteniendo el resto de la estructura.

**Requisitos funcionales**
- Eliminar `<producto>` cuya `<categoria>` sea distinta de “Tecnologia”.
- Si `number(precio) > 1000`, sustituir el contenido por `***REDACTED***` (preservando el atributo `moneda`).
- Cambiar el elemento raíz de `catalogo` a `catalogo_auditoria`.

**Criterios de aceptación**
- Implementar **patrón de identidad** (`match="@*|node()"` con `copy/apply-templates`).
- Al menos **dos overrides**: (a) suprimir nodos, (b) redefinir nodo `<precio>`.
- Preservar atributos y orden de nodos no afectados.
- La transformación debe ser **idempotente** (aplicarla dos veces no cambia el resultado).

**Sugerencia técnica (pistas)**
- Suprimir nodos con plantilla **vacía**:
  ```xml
  <xsl:template match="producto[categoria != 'Tecnologia']"/>
  ```
- Redactar precio en productos filtrados por condición en el `match`:
  ```xml
  <xsl:template match="producto[number(precio) &gt; 1000]/precio">
    <precio>
      <xsl:attribute name="moneda"><xsl:value-of select="@moneda"/></xsl:attribute>
      ***REDACTED***
    </precio>
  </xsl:template>
  ```
- Cambiar raíz:
  ```xml
  <xsl:template match="/catalogo">
    <catalogo_auditoria>
      <xsl:apply-templates select="@*|node()"/>
    </catalogo_auditoria>
  </xsl:template>
  ```

**Ejecución (Saxon HE)**
```bash
cd ejercicios/e2-filtrado
java -jar ../../tools/saxon-he.jar -s:../../data/catalogo.xml -xsl:e2.xsl -o:e2.xml
```

---

## 🧩 Ejercicio 3 — Agrupación por categoría (Muenchian grouping, XSLT 1.0)

**Contexto**  
Dirección solicita un **reporte por categorías** que muestre cuántos productos hay en cada una y sus nombres listados.

**Objetivo**  
Generar un HTML con secciones por categoría: un `<h3>` con “NombreCategoria (conteo)” y una lista `<ul>` con los productos de esa categoría.

**Requisitos funcionales**
- Título de grupo: `Categoria (N)` donde `N` es el conteo de productos por categoría.
- Bajo cada título, `<ul><li>NombreProducto</li>...</ul>`.
- Ordenar las categorías alfabéticamente.

**Criterios de aceptación**
- Implementar **Muenchian grouping** con `xsl:key` y `generate-id()`.
- Evitar duplicados por categoría.
- Salida HTML válida.

**Sugerencia técnica (esqueleto)**
```xml
<xsl:key name="kByCat" match="producto" use="categoria"/>

<!-- Categorías distintas -->
<xsl:for-each select="catalogo/producto[generate-id() = generate-id(key('kByCat', categoria)[1])]">
  <xsl:sort select="categoria"/>
  <h3>
    <xsl:value-of select="categoria"/>
    <xsl:text> (</xsl:text>
    <xsl:value-of select="count(key('kByCat', categoria))"/>
    <xsl:text>)</xsl:text>
  </h3>
  <ul>
    <xsl:for-each select="key('kByCat', categoria)">
      <li><xsl:value-of select="nombre"/></li>
    </xsl:for-each>
  </ul>
</xsl:for-each>
```

**Ejecución (xsltproc)**
```bash
cd ejercicios/e3-grupos
xsltproc e3.xsl ../../data/catalogo.xml > e3.html
```

---

## 🌐 Ejercicio 4 — Namespaces en feeds (selección correcta con prefijos)

**Contexto**  
Debes consumir un **feed Atom** (usa namespace por defecto). Tu tarea es extraer los títulos de las entradas a una lista HTML. Muchos selectores XPath fallan si no se respetan los namespaces.

**Objetivo**  
Generar un HTML con `Noticias` como encabezado y una lista `<ul>` de títulos de `<entry>`.

**Requisitos funcionales**
- Declarar el **namespace Atom** en el XSLT con un **prefijo** (por ejemplo, `a`).
- Usar el prefijo en **todos** los selectores XPath.
- Generar un `<h2>Noticias</h2>` y `<ul><li>Item ...</li></ul>`.

**Criterios de aceptación**
- Si usas selectores **sin prefijo**, no cumple (fijar el hábito correcto).
- HTML válido.

**Sugerencia técnica (esqueleto)**
```xml
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:a="http://www.w3.org/2005/Atom"
  exclude-result-prefixes="a">

  <xsl:template match="/">
    <html><body>
      <h2><xsl:value-of select="a:feed/a:title"/></h2>
      <ul>
        <xsl:for-each select="a:feed/a:entry">
          <li><xsl:value-of select="a:title"/></li>
        </xsl:for-each>
      </ul>
    </body></html>
  </xsl:template>
</xsl:stylesheet>
```

**Ejecución (xsltproc)**
```bash
cd ejercicios/e4-namespaces
xsltproc e4.xsl ../../data/feed-atom.xml > e4.html
```

---

## 📎 Apéndice: Snippets útiles

**Patrón de identidad**
```xml
<xsl:template match="@*|node()">
  <xsl:copy>
    <xsl:apply-templates select="@*|node()"/>
  </xsl:copy>
</xsl:template>
```

**Orden compuesto (ejemplo genérico)**
```xml
<xsl:sort select="stock = 0" data-type="text" order="ascending"/>
<xsl:sort select="number(precio)" data-type="number" order="ascending"/>
```

**Muenchian grouping (clave por categoría)**
```xml
<xsl:key name="kByCat" match="producto" use="categoria"/>
```

**Declaración de namespace Atom**
```xml
xmlns:a="http://www.w3.org/2005/Atom"
```
