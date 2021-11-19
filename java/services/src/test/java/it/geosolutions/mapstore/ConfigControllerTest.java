/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
package it.geosolutions.mapstore;

import static org.junit.Assert.assertEquals;

import java.io.File;
import java.io.IOException;

import javax.servlet.ServletContext;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

import it.geosolutions.mapstore.controllers.configs.ConfigsController;

public class ConfigControllerTest {
    ConfigsController controller;

    @Before
    public void setUp() {
        controller = new ConfigsController();
    }

    @Test
    public void testLoadAllowedResource() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        File tempResource = TestUtils.copyToTemp(ConfigControllerTest.class, "/localConfig.json");
        Mockito.when(context.getRealPath(Mockito.anyString())).thenReturn(tempResource.getAbsolutePath());
        controller.setContext(context);
        String resource = new String(controller.loadResource("localConfig", false), "UTF-8");
        assertEquals("{}", resource.trim());
        tempResource.delete();
    }

    @Test
    public void testLoadFromDataDir() throws IOException {
        File dataDir = TestUtils.getDataDir();
        File tempResource = TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/localConfig.json"), dataDir, "configs/localConfig.json");
        controller.setDataDir(dataDir.getAbsolutePath());
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        String resource = new String(controller.loadResource("localConfig.json", false), "UTF-8");
        assertEquals("{}", resource.trim());
        tempResource.delete();
    }

    @Test
    public void testLoadFromManyDataDir() throws IOException {
        File dataDir1 = TestUtils.getDataDir();
        File dataDir2 = TestUtils.getDataDir();
        File tempResource1 = TestUtils.copyTo(
                ConfigControllerTest.class.getResourceAsStream("/localConfig.json"), dataDir1,
                "configs/localConfig.json");
        controller.setDataDir(dataDir1.getAbsolutePath() + "," + dataDir2.getAbsolutePath());
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        String resource1 = new String(controller.loadResource("localConfig.json", false), "UTF-8");
        assertEquals("{}", resource1.trim());
        
        tempResource1.delete();
    }

    @Test
    public void testOverrides() throws IOException {
        File tempResource = TestUtils.copyToTemp(ConfigControllerTest.class, "/localConfigFull.json");
        File tempProperties = TestUtils.copyToTemp(ConfigControllerTest.class, "/mapstore.properties");
        ServletContext context = Mockito.mock(ServletContext.class);
        Mockito.when(context.getRealPath(Mockito.endsWith(".json"))).thenReturn(tempResource.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.endsWith(".properties"))).thenReturn(tempProperties.getAbsolutePath());
        controller.setContext(context);
        controller.setOverrides(tempProperties.getAbsolutePath());
        controller.setMappings("header.height=headerHeight,header.url=headerUrl");
        String resource = new String(controller.loadResource("localConfig", true), "UTF-8");
        assertEquals("{\"header\":{\"height\":\"200\",\"url\":\"https://mapstore2.geo-solutions.it\"}}", resource.trim());
        tempResource.delete();
    }
    @Test
    public void testOverridesWithDataDir() throws IOException {
    	File dataDir = TestUtils.getDataDir();
        controller.setDataDir(dataDir.getAbsolutePath());
        File tempResource = TestUtils.copyToTemp(ConfigControllerTest.class, "/localConfigFull.json");
        ServletContext context = Mockito.mock(ServletContext.class);
        Mockito.when(context.getRealPath(Mockito.endsWith(".json"))).thenReturn(tempResource.getAbsolutePath());
        TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/mapstore.properties"), dataDir,
        		"/mapstore.properties");
        controller.setContext(context);
        controller.setOverrides("mapstore.properties");
        controller.setMappings("header.height=headerHeight,header.url=headerUrl");
        String resource = new String(controller.loadResource("localConfig", true), "UTF-8");
        assertEquals("{\"header\":{\"height\":\"200\",\"url\":\"https://mapstore2.geo-solutions.it\"}}", resource.trim());
        tempResource.delete();
    }

    @Test
    public void testPatch() throws IOException {
        File dataDir = TestUtils.getDataDir();
        controller.setDataDir(dataDir.getAbsolutePath());
        File tempResource = TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/pluginsConfig.json"), dataDir, "configs/pluginsConfig.json");
        File tempPatch = TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/pluginsConfig.json.patch"), dataDir,
                "configs/pluginsConfig.json.patch");
        ServletContext context = Mockito.mock(ServletContext.class);
        Mockito.when(context.getRealPath(Mockito.endsWith(".json"))).thenReturn(tempResource.getAbsolutePath());
        controller.setContext(context);
        String resource = new String(controller.loadResource("pluginsConfig.json", true), "UTF-8");
        assertEquals("{\"plugins\":[{\"name\":\"My\",\"dependencies\":[\"Toolbar\"],\"extension\":true}]}", resource.trim());
        tempResource.delete();
        tempPatch.delete();
    }
    @Test
    public void testPatchWithNoExtension() throws IOException {
        File dataDir = TestUtils.getDataDir();
        controller.setDataDir(dataDir.getAbsolutePath());
        File tempResource = TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/pluginsConfig.json"), dataDir, "configs/pluginsConfig.json");
        File tempPatch = TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/pluginsConfig.json.patch"), dataDir,
                "configs/pluginsConfig.json.patch");
        ServletContext context = Mockito.mock(ServletContext.class);
        Mockito.when(context.getRealPath(Mockito.endsWith(".json"))).thenReturn(tempResource.getAbsolutePath());
        controller.setContext(context);
        String resource = new String(controller.loadResource("pluginsConfig", true), "UTF-8");
        assertEquals("{\"plugins\":[{\"name\":\"My\",\"dependencies\":[\"Toolbar\"],\"extension\":true}]}", resource.trim());
        tempResource.delete();
        tempPatch.delete();
    }
}
