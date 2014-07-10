<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="/">
        <html>
            <body>
                <xsl:for-each select="data/pagination/page">
                    <li>
						<a>
							<xsl:attribute name="href">
								<xsl:text>#/page/</xsl:text>
								<xsl:value-of select="text()" />
                        	</xsl:attribute>
							<xsl:value-of select="text()" />
						</a>
                    </li>
                </xsl:for-each>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>