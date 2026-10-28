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

import org.junit.Assert;
import org.junit.Test;

import java.io.File;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

public final class AuditingOutputTest extends AuditingTestsBase {

    @Test
    public void testAuditOutput() throws InterruptedException {
        AuditingOutput auditingOutput = new AuditingOutput();
        Assert.assertEquals(auditingOutput.isAuditEnable(), true);
        Map<String, String> message1 = createTestMessage("1");
        Map<String, String> message2 = createTestMessage("2");
        Map<String, String> message3 = createTestMessage("3");
        File outputFile = new File(OUTPUT_DIRECTORY, "audit-geostore.txt");
        offerMessage(auditingOutput, outputFile, message1);
        AuditingTestsUtils.checkFileExistsWithContent(outputFile, contentWithoutEnd(message1));
        offerMessage(auditingOutput, outputFile, message2);
        AuditingTestsUtils.checkFileExistsWithContent(
                outputFile, contentWithoutEnd(message1, message2));
        offerMessage(auditingOutput, outputFile, message3);
        File rolledFile =
                new File(
                        OUTPUT_DIRECTORY,
                        String.format(
                                "audit-geostore-%s-1.txt",
                                auditingOutput.getAuditingFilesManager().getCurrentDayTag()));
        AuditingTestsUtils.waitFileExists(rolledFile, 5000);
        AuditingTestsUtils.checkFileExistsWithContent(outputFile, "*START*");
        AuditingTestsUtils.checkFileExistsWithContent(
                rolledFile, contentWithEnd(message1, message2, message3));
    }

    private void offerMessage(
            AuditingOutput auditingOutput, File outputFile, Map<String, String> message)
            throws InterruptedException {
        long checksum = AuditingTestsUtils.checksum(outputFile);
        auditingOutput.offerMessage(copy(message));
        AuditingTestsUtils.waitFileChange(outputFile, checksum, 5000);
    }

    private static Map<String, String> createTestMessage(String label) {
        Map<String, String> message = new LinkedHashMap<String, String>();
        message.put(AuditInfo.HTTP_METHOD.getKey(), "HTTP_METHOD");
        message.put(AuditInfo.PATH.getKey(), "PATH" + "-" + label);
        message.put(AuditInfo.BASE_PATH.getKey(), "BASE_PATH" + "-" + label);
        message.put(AuditInfo.QUERY_STRING.getKey(), "QUERY_STRING" + "-" + label);
        message.put(AuditInfo.REMOTE_ADDR.getKey(), "REMOTE_ADDR" + "-" + label);
        message.put(AuditInfo.REMOTE_HOST.getKey(), "REMOTE_HOST" + "-" + label);
        message.put(AuditInfo.REMOTE_USER.getKey(), "REMOTE_USER" + "-" + label);
        message.put(AuditInfo.USER_NAME.getKey(), "USER_NAME" + "-" + label);
        message.put(AuditInfo.USER_ROLE.getKey(), "USER_ROLE" + "-" + label);
        message.put(AuditInfo.USER_GROUPS.getKey(), "USER_GROUPS" + "-" + label);
        message.put(AuditInfo.HOST.getKey(), "HOST" + "-" + label);
        message.put(AuditInfo.BODY_AS_STRING.getKey(), "BODY_AS_STRING" + "-" + label);
        message.put(AuditInfo.ERROR_MESSAGE.getKey(), "ERROR_MESSAGE" + "-" + label);
        message.put(AuditInfo.FAILED.getKey(), "FAILED" + "-" + label);
        message.put(AuditInfo.RESPONSE_STATUS_CODE.getKey(), "RESPONSE_STATUS_CODE" + "-" + label);
        message.put(
                AuditInfo.RESPONSE_CONTENT_TYPE.getKey(), "RESPONSE_CONTENT_TYPE" + "-" + label);
        message.put(AuditInfo.RESPONSE_LENGTH.getKey(), "RESPONSE_LENGTH" + "-" + label);
        message.put(AuditInfo.START_TIME.getKey(), "START_TIME" + "-" + label);
        message.put(AuditInfo.END_TIME.getKey(), "END_TIME" + "-" + label);
        message.put(AuditInfo.TOTAL_TIME.getKey(), "TOTAL_TIME" + "-" + label);
        return message;
    }

    private static String contentWithoutEnd(Map<String, String>... messages) {
        StringBuilder content = new StringBuilder("*START*\n");
        int i = 0;
        for (Map<String, String> message : messages) {
            content.append("---\n").append(i).append("\n");
            for (String value : message.values()) {
                content.append(value).append("\n");
            }
            content.append("---\n");
            i++;
        }
        return content.toString();
    }

    private static String contentWithEnd(Map<String, String>... messages) {
        return contentWithoutEnd(messages) + "*END*";
    }

    private Map<String, String> copy(Map<String, String> original) {
        Map<String, String> copy = new HashMap<String, String>();
        for (Map.Entry<String, String> entry : original.entrySet()) {
            copy.put(entry.getKey(), entry.getValue());
        }
        return copy;
    }
}
