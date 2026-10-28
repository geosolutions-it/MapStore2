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
import static org.junit.Assert.assertNotNull;

import org.junit.Test;

import java.util.Map;

public final class AuditingConfigurationTest extends AuditingTestsBase {

    @Test
    public void testSimpleConfiguration() {
        AuditingConfiguration auditingConfiguration = new AuditingConfiguration();
        assertEquals(auditingConfiguration.isAuditEnable(), true);
        assertEquals(auditingConfiguration.getMaxRequestPerFile(), 3);
        assertEquals(auditingConfiguration.getTemplatesVersion(), 1);
        assertEquals(
                auditingConfiguration.getOutputDirectory(), OUTPUT_DIRECTORY.getAbsolutePath());
        assertEquals(auditingConfiguration.getOutputFilesExtension(), "txt");
        assertEquals(
                auditingConfiguration.getTemplatesDirectory(),
                TEMPLATES_DIRECTORY.getAbsolutePath());
    }

    @Test
    public void testUpdateConfiguration() {
        AuditingConfiguration auditingConfiguration = new AuditingConfiguration();
        assertEquals(auditingConfiguration.isAuditEnable(), true);
        Map<String, String> properties =
                AuditingTestsUtils.getDefaultProperties(OUTPUT_DIRECTORY, TEMPLATES_DIRECTORY);
        properties.put(AuditingConfiguration.AUDIT_ENABLE, "false");
        AuditingTestsUtils.createFile(
                CONFIGURATION_FILE_PATH, AuditingTestsUtils.propertiesToString(properties));
        AuditingConfiguration newAuditingConfiguration =
                auditingConfiguration.checkForNewConfiguration();
        assertNotNull(newAuditingConfiguration);
    }
}
