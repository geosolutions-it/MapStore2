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
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.File;
import java.io.FileInputStream;
import java.util.Properties;

final class AuditingConfiguration {

    private static final Logger LOGGER = LogManager.getLogger(AuditingConfiguration.class);

    static final String CONFIGURATION_PATH = "GEOSTORE_AUDITING_CONF";

    static final String AUDIT_ENABLE = "auditing.enable";
    static final String TEMPLATES_DIRECTORY = "auditing.templates.directory";
    static final String OUTPUT_DIRECTORY = "auditing.output.directory";
    static final String TEMPLATES_VERSION = "auditing.templates.version";
    static final String MAX_RESQUEST_PER_FILE = "auditing.max.requests.per.file";
    static final String OUTPUT_FILES_EXTENSION = "auditing.output.files.extension";

    private final File configurationFile;
    private final long configurationFileChecksum;

    private final boolean auditEnable;
    private final String templatesDirectory;
    private final String outputDirectory;
    private final int templatesVersion;
    private final int maxRequestPerFile;
    private final String outputFilesExtension;

    AuditingConfiguration() {
        this(null, 0l);
    }

    AuditingConfiguration(File configurationFile, long configurationFileChecksum) {
        if (configurationFile == null) {
            this.configurationFile = findConfigurationFile();
            this.configurationFileChecksum = checksum(this.configurationFile);
        } else {
            this.configurationFile = configurationFile;
            this.configurationFileChecksum = configurationFileChecksum;
        }

        Properties properties = readProperties();
        auditEnable = Boolean.parseBoolean(getProperty(properties, AUDIT_ENABLE));
        templatesDirectory = getProperty(properties, TEMPLATES_DIRECTORY);
        outputDirectory = getProperty(properties, OUTPUT_DIRECTORY);
        templatesVersion = Integer.parseInt(getProperty(properties, TEMPLATES_VERSION));
        maxRequestPerFile = Integer.parseInt(getProperty(properties, MAX_RESQUEST_PER_FILE));
        outputFilesExtension = getProperty(properties, OUTPUT_FILES_EXTENSION);
    }

    static boolean configurationExists() {
        return findConfigurationFile() != null;
    }

    boolean isAuditEnable() {
        return auditEnable;
    }

    String getTemplatesDirectory() {
        return templatesDirectory;
    }

    String getOutputDirectory() {
        return outputDirectory;
    }

    int getTemplatesVersion() {
        return templatesVersion;
    }

    int getMaxRequestPerFile() {
        return maxRequestPerFile;
    }

    String getOutputFilesExtension() {
        return outputFilesExtension;
    }

    AuditingConfiguration checkForNewConfiguration() {
        File candidateConfigurationFile = findConfigurationFile();
        long candidateConfigurationFileChecksum = checksum(candidateConfigurationFile);
        if (configurationFile.compareTo(candidateConfigurationFile) != 0
                || configurationFileChecksum != candidateConfigurationFileChecksum) {
            return new AuditingConfiguration(
                    candidateConfigurationFile, candidateConfigurationFileChecksum);
        }
        return null;
    }

    private long checksum(File file) {
        try {
            return FileUtils.checksumCRC32(file);
        } catch (Exception exception) {
            throw new AuditingException(
                    exception, "Error computing checksum of file '%s'.", file.getPath());
        }
    }

    private static File findConfigurationFile() {
        String configurationFilePath = System.getProperty(CONFIGURATION_PATH);
        if (configurationFilePath == null) {
            configurationFilePath = System.getenv(CONFIGURATION_PATH);
        }
        if (configurationFilePath == null) {
            LOGGER.warn("Could not found configuration path property.");
            return null;
        }
        File configurationFile = new File(configurationFilePath);
        if (!configurationFile.exists()) {
            throw new AuditingException(
                    "Configuration file '%s' does not exists.", configurationFile.getPath());
        }
        return configurationFile;
    }

    private Properties readProperties() {
        try (FileInputStream input = new FileInputStream(configurationFile)) {
            Properties properties = new Properties();
            properties.load(input);
            input.close();
            return properties;
        } catch (Exception exception) {
            throw new AuditingException(
                    exception,
                    "Error reading properties from configuration file '%s'.",
                    configurationFile.getPath());
        }
    }

    private static String getProperty(Properties properties, String propertyName) {
        String propertyValue = properties.getProperty(propertyName);
        if (propertyValue == null) {
            throw new AuditingException("Missing configuration property '%s'.", propertyName);
        }
        return propertyValue;
    }
}
