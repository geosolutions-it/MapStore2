/* ====================================================================
 *
 * Copyright (C) 2007 - 2015 GeoSolutions S.A.S.
 * http://www.geo-solutions.it
 *
 * GPLv3 + Classpath exception
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.
 *
 * ====================================================================
 *
 * This software consists of voluntary contributions made by developers
 * of GeoSolutions.  For more information on GeoSolutions, please see
 * <http://www.geo-solutions.it/>.
 *
 */
package it.geosolutions.geostore.services.rest.auditing;

import static org.junit.Assert.assertEquals;

import freemarker.template.TemplateException;

import org.junit.Test;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public final class AuditingTemplatesTest extends AuditingTestsBase {

    @Test
    public void testTemplatesWriting() throws InterruptedException, IOException, TemplateException {
        File outputFile = new File(OUTPUT_DIRECTORY, "audit-geostore.txt");
        AuditingConfiguration configuration = new AuditingConfiguration();
        AuditingTemplates templates = new AuditingTemplates(configuration.getTemplatesDirectory());
        assertEquals(templates.getHeaderTemplate().getName(), "header.ftl");
        assertEquals(templates.getBodyTemplate().getName(), "body.ftl");
        assertEquals(templates.getFooterTemplate().getName(), "footer.ftl");
        FileWriter writer = new FileWriter(outputFile);
        templates.getHeaderTemplate().process(Collections.EMPTY_MAP, writer);
        Map<String, String> content = createContent();
        templates.getBodyTemplate().process(content, writer);
        templates.getFooterTemplate().process(Collections.EMPTY_MAP, writer);
        AuditingTestsUtils.checkFileExistsWithContent(outputFile, contentToString(content));
    }

    static Map<String, String> createContent() {
        Map<String, String> message = new LinkedHashMap<String, String>();
        message.put("id", "0");
        message.put(AuditInfo.HTTP_METHOD.getKey(), "HTTP_METHOD");
        message.put(AuditInfo.PATH.getKey(), "PATH");
        message.put(AuditInfo.BASE_PATH.getKey(), "BASE_PATH");
        message.put(AuditInfo.QUERY_STRING.getKey(), "QUERY_STRING");
        message.put(AuditInfo.REMOTE_ADDR.getKey(), "REMOTE_ADDR");
        message.put(AuditInfo.REMOTE_HOST.getKey(), "REMOTE_HOST");
        message.put(AuditInfo.REMOTE_USER.getKey(), "REMOTE_USER");
        message.put(AuditInfo.USER_NAME.getKey(), "USER_NAME");
        message.put(AuditInfo.USER_ROLE.getKey(), "USER_ROLE");
        message.put(AuditInfo.USER_GROUPS.getKey(), "USER_GROUPS");
        message.put(AuditInfo.HOST.getKey(), "HOST");
        message.put(AuditInfo.BODY_AS_STRING.getKey(), "BODY_AS_STRING");
        message.put(AuditInfo.ERROR_MESSAGE.getKey(), "ERROR_MESSAGE");
        message.put(AuditInfo.FAILED.getKey(), "FAILED");
        message.put(AuditInfo.RESPONSE_STATUS_CODE.getKey(), "RESPONSE_STATUS_CODE");
        message.put(AuditInfo.RESPONSE_CONTENT_TYPE.getKey(), "RESPONSE_CONTENT_TYPE");
        message.put(AuditInfo.RESPONSE_LENGTH.getKey(), "RESPONSE_LENGTH");
        message.put(AuditInfo.START_TIME.getKey(), "START_TIME");
        message.put(AuditInfo.END_TIME.getKey(), "END_TIME");
        message.put(AuditInfo.TOTAL_TIME.getKey(), "TOTAL_TIME");
        return message;
    }

    static String contentToString(Map<String, String> content) {
        StringBuilder stringBuilder = new StringBuilder("*START*\n");
        stringBuilder.append("---\n");
        for (String value : content.values()) {
            stringBuilder.append(value).append("\n");
        }
        stringBuilder.append("---\n");
        stringBuilder.append("*END*");
        return stringBuilder.toString();
    }
}
