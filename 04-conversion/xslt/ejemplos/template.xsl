<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:strip-space elements="*"/>

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Catálogo</title>
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
          .agotado { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>Catalogo de Productos</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
            </tr>
          </thead>
            <xsl:for-each select="catalogo/producto">
              <xsl:sort select="number(stock)" data-type="number" order="ascending"/>
              <tr>
                <td><xsl:value-of select="@id"/></td>
                <td><xsl:value-of select="nombre"/></td>
                <td><xsl:value-of select="categoria"/></td>
                <td><xsl:value-of select="concat(precio/@moneda, ' $', format-number(number(precio), '0.00'))"/></td>
                <td>
                  <xsl:choose>
                    <xsl:when test="number(stock) &gt; 0">
                      <xsl:value-of select="stock"/>
                    </xsl:when>
                    <xsl:otherwise>
                      <span class="agotado">Agotado</span>
                    </xsl:otherwise>
                  </xsl:choose>
                </td>
              </tr>
            </xsl:for-each>
          <tbody>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
