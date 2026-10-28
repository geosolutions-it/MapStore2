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

import org.junit.After;
import org.junit.Before;

import java.io.File;
import java.net.URISyntaxException;
import java.util.UUID;

/**
 * Base class that defines the necessary tests directories and make everything is cleaned at the
 * end.
 */
public abstract class AuditingTestsBase {

    protected final File TESTS_ROOT_DIRECTORY =
            new File(
                    System.getProperty("java.io.tmpdir"),
                    "auditing-tests-" + UUID.randomUUID().toString());
    protected final File OUTPUT_DIRECTORY = new File(TESTS_ROOT_DIRECTORY, "output");
    protected final File TEMPLATES_DIRECTORY = getTemplatesDirectory();
    protected final File CONFIGURATION_DIRECTORY = new File(TESTS_ROOT_DIRECTORY, "configuration");
    protected final File CONFIGURATION_FILE_PATH =
            new File(CONFIGURATION_DIRECTORY, "auditing.properties");

    private File getTemplatesDirectory() {
        try {
            return new File(
                    AuditingTestsUtils.class
                            .getClassLoader()
                            .getResource("templates")
                            .toURI()
                            .getPath());
        } catch (URISyntaxException exception) {
            throw new RuntimeException("Error getting tests templates directory.");
        }
    }

    @Before
    public void before() {
        AuditingTestsUtils.initDirectory(TESTS_ROOT_DIRECTORY);
        AuditingTestsUtils.createDefaultConfiguration(
                CONFIGURATION_DIRECTORY,
                CONFIGURATION_FILE_PATH,
                OUTPUT_DIRECTORY,
                TEMPLATES_DIRECTORY);
        AuditingTestsUtils.initDirectory(OUTPUT_DIRECTORY);
    }

    @After
    public void after() {
        AuditingTestsUtils.deleteDirectory(TESTS_ROOT_DIRECTORY);
    }
}
