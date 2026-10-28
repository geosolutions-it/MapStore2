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

import org.apache.commons.io.FileUtils;
import org.junit.Assert;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

final class AuditingTestsUtils {

    static File randomDirectory(File original) {
        return new File(original.getPath() + "-" + UUID.randomUUID().toString());
    }

    static void createDefaultConfiguration(
            File configurationDirectory,
            File configurationFilePath,
            File outputDirectory,
            File templatesDirectory) {
        initDirectory(configurationDirectory);
        System.setProperty(
                AuditingConfiguration.CONFIGURATION_PATH, configurationFilePath.getAbsolutePath());
        String properties =
                propertiesToString(getDefaultProperties(outputDirectory, templatesDirectory));
        createFile(configurationFilePath, properties);
    }

    static void initDirectory(File directory) {
        deleteDirectory(directory);
        createDirectory(directory);
    }

    static void createDirectory(File directory) {
        try {
            FileUtils.forceMkdir(directory);
        } catch (Exception exception) {
            throw new AuditingException(
                    exception, "Error creating directory '%s'.", directory.getAbsolutePath());
        }
    }

    static void deleteDirectory(File directory) {
        deleteFile(directory);
    }

    static void deleteFile(File file) {
        if (!file.getAbsolutePath().contains("auditing-tests")) {
            throw new AuditingException(
                    "This path '%s' requested to delete looks suspicious.", file.getAbsolutePath());
        }
        try {
            FileUtils.deleteQuietly(file);
        } catch (Exception exception) {
            throw new AuditingException(
                    exception, "Error deleting file '%s'.", file.getAbsolutePath());
        }
    }

    static void createFile(File file, String fileContent) {
        deleteFile(file);
        writeToFile(file, fileContent);
    }

    static void writeToFile(File file, String fileContent) {
        try {
            FileWriter writer = new FileWriter(file);
            writer.write(fileContent);
            writer.flush();
            writer.close();
        } catch (Exception exception) {
            throw new AuditingException(
                    exception, "Error writing content to file '%s'.", file.getAbsolutePath());
        }
    }

    static String readFile(File file) {
        try {
            FileInputStream input = new FileInputStream(file);
            byte[] data = new byte[(int) file.length()];
            input.read(data);
            input.close();
            return new String(data).replaceAll("\\r\\n", "\n");
        } catch (Exception exception) {
            throw new AuditingException(
                    exception, "Error reading file '%s' content.", file.getAbsolutePath());
        }
    }

    static Map<String, String> getDefaultProperties(File outputDirectory, File templatesDirectory) {
        Map<String, String> properties = new HashMap<String, String>();
        properties.put(AuditingConfiguration.AUDIT_ENABLE, "true");
        properties.put(AuditingConfiguration.MAX_RESQUEST_PER_FILE, "3");
        properties.put(
                AuditingConfiguration.OUTPUT_DIRECTORY,
                outputDirectory.getAbsolutePath().replace("\\", "\\\\"));
        properties.put(AuditingConfiguration.OUTPUT_FILES_EXTENSION, "txt");
        properties.put(
                AuditingConfiguration.TEMPLATES_DIRECTORY,
                templatesDirectory.getAbsolutePath().replace("\\", "\\\\"));
        properties.put(AuditingConfiguration.TEMPLATES_VERSION, "1");
        return properties;
    }

    static String propertiesToString(Map<String, String> properties) {
        StringBuilder stringBuilder = new StringBuilder();
        for (Map.Entry<String, String> property : properties.entrySet()) {
            stringBuilder
                    .append(property.getKey())
                    .append('=')
                    .append(property.getValue())
                    .append("\n");
        }
        return stringBuilder.toString();
    }

    static void checkDirectoryContainsFiles(File directory, File... expectedFiles) {
        Collection existingFiles = FileUtils.listFiles(directory, null, false);
        Assert.assertEquals(existingFiles.size(), expectedFiles.length);
        for (File expectedFile : expectedFiles) {
            Assert.assertTrue(existingFiles.contains(expectedFile));
        }
    }

    static void checkFileExistsWithContent(File file, String content) {
        Assert.assertTrue(file.exists());
        Assert.assertEquals(readFile(file).trim(), content.trim());
    }

    static void checkDirectoryIsEmpty(File directory) {
        Assert.assertEquals(FileUtils.listFiles(directory, null, false).size(), 0);
    }

    static long checksum(File file) {
        try {
            return FileUtils.checksumCRC32(file);
        } catch (Exception exception) {
            throw new AuditingException(
                    exception, "Error computing checksum of file '%s'.", file.getAbsolutePath());
        }
    }

    static void waitFileChange(File file, long checksum, long timeoutInMs)
            throws InterruptedException {
        for (int i = 0; i < timeoutInMs / 100; i++) {
            if (checksum(file) != checksum) {
                return;
            }
            Thread.sleep(100);
        }
    }

    static void waitFileExists(File file, long timeoutInMs) throws InterruptedException {
        for (int i = 0; i < timeoutInMs / 100; i++) {
            if (file.exists()) {
                return;
            }
            Thread.sleep(100);
        }
    }
}
