<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="/">
        <html>
            <body>
                <xsl:for-each select="data/posts/post">
                    <li>
                        <xsl:attribute name="data-id">
                            <xsl:value-of select="id" />
                        </xsl:attribute>
                        <h2><xsl:value-of select="title" /></h2>
                        <span>by fsot on <span> <xsl:value-of select="date" /></span></span>
                        <p><xsl:value-of select="content" /></p>
                        <a href="#" data-event="renderEditPostPage">edit</a>&#160;<a href="#" data-event="deletePost">delete</a>
                    </li>
                </xsl:for-each>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>