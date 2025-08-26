<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- Salida HTML (modo HTML para navegadores antiguos y compatibilidad general) -->
  <xsl:output method="html" version="5.0" encoding="UTF-8" indent="yes"/>

  <!-- Plantilla raíz -->
  <xsl:template match="/">
    <html>
      <head>
        <meta charset="UTF-8"/>
        <title>
          <xsl:text>Catálogo · </xsl:text>
          <xsl:value-of select="biblioteca/nombre"/>
        </title>
        <style>
          /* estilos mínimos para presentar la lista */
          html, body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 0; padding: 0; }
          header { padding: 24px; border-bottom: 1px solid #ddd; }
          h1 { margin: 0 0 4px; font-size: 22px; }
          .meta { color: #666; font-size: 13px; }
          main { padding: 24px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px 12px; border-bottom: 1px solid #eee; text-align: left; vertical-align: top; }
          th { background: #fafafa; }
          .tag { display: inline-block; padding: 2px 8px; border: 1px solid #ddd; border-radius: 999px; font-size: 12px; margin-right: 6px; margin-bottom: 4px; }
          tfoot td { color: #555; font-size: 13px; }
        </style>
      </head>
      <body>
        <header>
          <h1>
            <xsl:text>Catálogo de </xsl:text>
            <xsl:value-of select="biblioteca/nombre"/>
          </h1>
          <div class="meta">
            <xsl:text>Ubicación: </xsl:text>
            <xsl:value-of select="biblioteca/ubicacion"/>
            <xsl:text> · Total libros: </xsl:text>
            <xsl:value-of select="count(biblioteca/libros/libro)"/>
          </div>
        </header>

        <main>
          <table aria-label="Listado de libros">
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Año</th>
                <th>Categorías</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              <!-- Recorremos y ordenamos por título -->
              <xsl:for-each select="biblioteca/libros/libro">
                <xsl:sort select="titulo" data-type="text" order="ascending"/>
                <tr id="{@id}">
                  <td><xsl:value-of select="titulo"/></td>
                  <td><xsl:value-of select="autor"/></td>
                  <td><xsl:value-of select="anio"/></td>
                  <td>
                    <xsl:for-each select="categorias/categoria">
                      <span class="tag"><xsl:value-of select="."/></span>
                    </xsl:for-each>
                  </td>
                  <td>
                    <xsl:value-of select="format-number(number(precio), '0.00')"/>
                    <xsl:text> </xsl:text>
                    <xsl:value-of select="precio/@moneda"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5">
                  <strong>Total:</strong>
                  <xsl:value-of select="format-number(sum(biblioteca/libros/libro/precio), '0.00')"/>
                  <xsl:text> EUR</xsl:text>
                </td>
              </tr>
            </tfoot>
          </table>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
