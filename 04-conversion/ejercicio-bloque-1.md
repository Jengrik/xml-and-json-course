# Ejercicios - Sesión 5: Transformación y Consumo de Datos
### Bloque 1 – Introducción a la Transformación de Datos

## Ejercicio 1 – Transformación para usuarios finales (XML → HTML)
**Contexto:**  
Una tienda en línea quiere mostrar su catálogo en la web. Los datos están en XML (exportados de un ERP) y deben transformarse a HTML.

**Tarea:**  
- Tomar el siguiente XML del catálogo:

```xml
<catalogo>
  <producto id="P001">
    <nombre>Laptop</nombre>
    <precio>1200</precio>
  </producto>
  <producto id="P002">
    <nombre>Mouse</nombre>
    <precio>25</precio>
  </producto>
</catalogo>
```

- Diseñar una transformación que muestre **nombre y precio** en una lista HTML.

**Preguntas de reflexión:**  
- ¿Qué pasa si agrego un nuevo campo en el XML (ej. `<stock>`) ?  
- ¿Cómo debería actualizarse la transformación?  

---

## Ejercicio 2 – Transformación para análisis interno (XML → XML filtrado)
**Contexto:**  
El área de compras necesita un informe solo de los productos **con precio menor a 50**.

**Tarea:**  
- Tomar el catálogo XML.  
- Crear una transformación que genere un XML nuevo solo con productos < 50.  

**XML de entrada de ejemplo:**

```xml
<catalogo>
  <producto id="P001">
    <nombre>Laptop</nombre>
    <precio>1200</precio>
  </producto>
  <producto id="P002">
    <nombre>Mouse</nombre>
    <precio>25</precio>
  </producto>
</catalogo>
```

**Resultado esperado:**

```xml
<productos_baratos>
  <producto>
    <nombre>Mouse</nombre>
    <precio>25</precio>
  </producto>
</productos_baratos>
```

**Preguntas de reflexión:**  
- ¿Qué utilidad tiene mantener el formato XML en lugar de convertirlo a otro?  

---

## Ejercicio 3 – Interoperabilidad (XML ↔ JSON)
**Contexto:**  
Una institución financiera envía datos de clientes en XML, pero una aplicación móvil solo acepta JSON.

**Tarea:**  
- Convertir el siguiente cliente XML a JSON.

**XML de entrada:**

```xml
<cliente id="C123">
  <nombre>Juan Perez</nombre>
  <email>juan@example.com</email>
</cliente>
```

**JSON esperado:**

```json
{
  "cliente": {
    "@id": "C123",
    "nombre": "Juan Perez",
    "email": "juan@example.com"
  }
}
```

**Preguntas de reflexión:**  
- ¿Qué diferencias se observan entre los dos formatos?  
- ¿Qué información se puede perder en el proceso?  
