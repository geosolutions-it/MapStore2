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

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateExceptionHandler;

import org.apache.commons.io.FileUtils;

import java.io.File;

final class AuditingTemplates {

    private static final String HEADER = "header.ftl";
    private static final String BODY = "body.ftl";
    private static final String FOOTER = "footer.ftl";

    private final File templatesDirectory;

    private final Template headerTemplate;
    private final Template bodyTemplate;
    private final Template footerTemplate;

    private final long headerTemplateChecksum;
    private final long bodyTemplateChecksum;
    private final long footerTemplateChecksum;

    AuditingTemplates(String templatesDirectoryPath) {
        this(templatesDirectoryPath, null, null, null);
    }

    AuditingTemplates(
            String templatesDirectoryPath,
            Long headerTemplateChecksum,
            Long bodyTemplateChecksum,
            Long footerTemplateChecksum) {
        templatesDirectory = getTemplatesDirectory(templatesDirectoryPath);
        Configuration configuration = getConfiguration();
        headerTemplate = getTemplate(configuration, HEADER);
        bodyTemplate = getTemplate(configuration, BODY);
        footerTemplate = getTemplate(configuration, FOOTER);
        this.headerTemplateChecksum =
                headerTemplateChecksum == null
                        ? checksum(new File(templatesDirectory, "header.ftl"))
                        : headerTemplateChecksum;
        this.bodyTemplateChecksum =
                bodyTemplateChecksum == null
                        ? checksum(new File(templatesDirectory, "body.ftl"))
                        : bodyTemplateChecksum;
        this.footerTemplateChecksum =
                footerTemplateChecksum == null
                        ? checksum(new File(templatesDirectory, "footer.ftl"))
                        : footerTemplateChecksum;
    }

    Template getHeaderTemplate() {
        return headerTemplate;
    }

    Template getBodyTemplate() {
        return bodyTemplate;
    }

    Template getFooterTemplate() {
        return footerTemplate;
    }

    AuditingTemplates checkForNewTemplates(String candidateTemplatesDirectoryPath) {
        File candidateTemplatesDirectory = getTemplatesDirectory(candidateTemplatesDirectoryPath);
        long candidateHeaderTemplateChecksum = checksum(new File(templatesDirectory, "header.ftl"));
        long candidateBodyTemplateChecksum = checksum(new File(templatesDirectory, "body.ftl"));
        long candidateFooterTemplateChecksum = checksum(new File(templatesDirectory, "footer.ftl"));
        if (templatesDirectory.compareTo(candidateTemplatesDirectory) != 0
                || headerTemplateChecksum == candidateHeaderTemplateChecksum
                || bodyTemplateChecksum == candidateBodyTemplateChecksum
                || footerTemplateChecksum == candidateFooterTemplateChecksum) {
            return new AuditingTemplates(
                    candidateTemplatesDirectoryPath,
                    candidateHeaderTemplateChecksum,
                    candidateBodyTemplateChecksum,
                    candidateFooterTemplateChecksum);
        }
        return null;
    }

    private File getTemplatesDirectory(String templatesDirectoryPath) {
        File file = new File(templatesDirectoryPath);
        if (!file.exists()) {
            throw new AuditingException(
                    "Templates directory '%s' does not exists.", templatesDirectoryPath);
        }
        return file;
    }

    private Configuration getConfiguration() {
        try {
            Configuration configuration = new Configuration();
            configuration.setDirectoryForTemplateLoading(templatesDirectory);
            configuration.setDefaultEncoding("UTF-8");
            configuration.setTemplateExceptionHandler(TemplateExceptionHandler.RETHROW_HANDLER);
            return configuration;
        } catch (Exception exception) {
            throw new AuditingException(
                    exception,
                    "Error initiating templates configuration from directory '%s'.",
                    templatesDirectory.getPath());
        }
    }

    private Template getTemplate(Configuration configuration, String templateName) {
        try {
            return configuration.getTemplate(templateName);
        } catch (Exception exception) {
            throw new AuditingException(exception, "Error getting template '%s'.", templateName);
        }
    }

    private long checksum(File file) {
        try {
            return FileUtils.checksumCRC32(file);
        } catch (Exception exception) {
            throw new AuditingException(
                    exception, "Error computign checksum of file '%s'.", file.getPath());
        }
    }
}
