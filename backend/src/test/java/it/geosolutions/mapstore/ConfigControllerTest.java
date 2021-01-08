/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
package it.geosolutions.mapstore;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;

import java.io.File;
import java.io.IOException;


import javax.servlet.ServletContext;


import org.apache.commons.io.FileUtils;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.servlet.HandlerMapping;

import it.geosolutions.mapstore.ConfigController.ResourceNotAllowedException;

public class ConfigControllerTest {
    ConfigController controller;

    @Before
    public void setUp() {
        controller = new ConfigController();
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
    public void testLoadNotAllowedResource() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        File tempResource = TestUtils.copyToTemp(ConfigControllerTest.class, "/localConfig.json");
        Mockito.when(context.getRealPath(Mockito.anyString())).thenReturn(tempResource.getAbsolutePath());
        controller.setContext(context);
        try {
            controller.loadResource("notAllowed", false);
            fail();
        } catch(ResourceNotAllowedException e) {
            assertNotNull(e);
        }
        tempResource.delete();
    }

    @Test
    public void testLoadFromDataDir() throws IOException {
        File dataDir = TestUtils.getDataDir();
        File tempResource = TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/localConfig.json"), dataDir, "localConfig.json");
        controller.setDataDir(dataDir.getAbsolutePath());
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        String resource = new String(controller.loadResource("localConfig", false), "UTF-8");
        assertEquals("{}", resource.trim());
        tempResource.delete();
    }

    @Test
    public void testLoadFromManyDataDir() throws IOException {
        File dataDir1 = TestUtils.getDataDir();
        File dataDir2 = TestUtils.getDataDir();
        File tempResource1 = TestUtils.copyTo(
                ConfigControllerTest.class.getResourceAsStream("/localConfig.json"), dataDir1,
                "localConfig.json");
        File tempResource2 =
                TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/extensions.json"),
                        dataDir2, "extensions.json");
        controller.setDataDir(dataDir1.getAbsolutePath() + "," + dataDir2.getAbsolutePath());
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        String resource1 = new String(controller.loadResource("localConfig", false), "UTF-8");
        assertEquals("{}", resource1.trim());
        String resource2 = new String(controller.loadResource("extensions", false), "UTF-8");
        assertEquals("{}", resource2.trim());
        tempResource1.delete();
        tempResource2.delete();
    }

    @Test
    public void testLoadAsset() throws IOException {
    	ServletContext context = Mockito.mock(ServletContext.class);
        File tempResource = TestUtils.copyToTemp(ConfigControllerTest.class, "/index.js");
        Mockito.when(context.getRealPath(Mockito.anyString())).thenReturn(tempResource.getAbsolutePath());
        controller.setContext(context);
    	MockHttpServletRequest request = new MockHttpServletRequest("GET", "/index.js");
    	MockHttpServletResponse response = new MockHttpServletResponse();
    	request.setAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE, "index.js");
        controller.loadAsset(request, response);
        assertEquals(response.getContentType(), "application/javascript");
        assertEquals("console.log('hello')\n", response.getContentAsString()); // \n should not be there, but is not a mess
        tempResource.delete();
    }
    @Test
    public void testLoadAssetFromAbsolutePathIsNotAllowed() throws IOException {
    	ServletContext context = Mockito.mock(ServletContext.class);
        File tempResource = TestUtils.copyToTemp(ConfigControllerTest.class, "/index.js");
        Mockito.when(context.getRealPath(Mockito.anyString())).thenReturn(tempResource.getAbsolutePath());
        controller.setContext(context);
    	MockHttpServletRequest request = new MockHttpServletRequest("GET", "/index.js");
    	MockHttpServletResponse response = new MockHttpServletResponse();
    	request.setAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE, new File("index.js").getAbsolutePath());
    	Exception found = null;
    	try {
    		controller.loadAsset(request, response);
    	} catch(Exception e) {
    		found = e;
    	} finally {
    		tempResource.delete();
    	}
    	assertNotNull(found);
    }    
    @Test
    public void testLoadJpegAsset() throws IOException {
    	ServletContext context = Mockito.mock(ServletContext.class);
        File tempResource = TestUtils.copyToTemp(ConfigControllerTest.class, "/test.jpg");
        Mockito.when(context.getRealPath(Mockito.anyString())).thenReturn(tempResource.getAbsolutePath());
        controller.setContext(context);
    	MockHttpServletRequest request = new MockHttpServletRequest("GET", "/test.jpg");
    	MockHttpServletResponse response = new MockHttpServletResponse();
    	request.setAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE, "test.jpg");
        controller.loadAsset(request, response);
        assertEquals(response.getContentType(), "image/jpeg");
        byte[] expected = FileUtils.readFileToByteArray(tempResource);
        byte[] result = response.getContentAsByteArray();
        assertEquals(expected.length, result.length);
        for(int i = 0; i < expected.length; i++) {
        	assertEquals(expected[i], result[i]);
        }

        tempResource.delete();
    }
    @Test
    public void testLoadPngAsset() throws IOException {
    	ServletContext context = Mockito.mock(ServletContext.class);
        File tempResource = TestUtils.copyToTemp(ConfigControllerTest.class, "/test.png");
        Mockito.when(context.getRealPath(Mockito.anyString())).thenReturn(tempResource.getAbsolutePath());
        controller.setContext(context);
    	MockHttpServletRequest request = new MockHttpServletRequest("GET", "/test.jpg");
    	MockHttpServletResponse response = new MockHttpServletResponse();
    	request.setAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE, "test.png");
        controller.loadAsset(request, response);
        assertEquals(response.getContentType(), "image/png");
        byte[] expected = FileUtils.readFileToByteArray(tempResource);
        byte[] result = response.getContentAsByteArray();
        assertEquals(expected.length, result.length);
        for(int i = 0; i < expected.length; i++) {
        	assertEquals(expected[i], result[i]);
        }
        tempResource.delete();
    }
    @Test
    public void testLoadCssAsset() throws IOException {
    	ServletContext context = Mockito.mock(ServletContext.class);
        File tempResource = TestUtils.copyToTemp(ConfigControllerTest.class, "/style.css");
        Mockito.when(context.getRealPath(Mockito.anyString())).thenReturn(tempResource.getAbsolutePath());
        controller.setContext(context);
    	MockHttpServletRequest request = new MockHttpServletRequest("GET", "/style.css");
    	MockHttpServletResponse response = new MockHttpServletResponse();
    	request.setAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE, "style.css");
        controller.loadAsset(request, response);
        assertEquals(response.getContentType(), "text/css");
        assertEquals(".test{background: none}\n", response.getContentAsString()); // \n should not be there, but is not a mess
        tempResource.delete();
    }


    @Test
    public void testLoadAssetFromDataDir() throws IOException {
    	File dataDir = TestUtils.getDataDir();
        File tempResource = TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/index.js"), dataDir, "index.js");
        controller.setDataDir(dataDir.getAbsolutePath());
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/index.js");
    	MockHttpServletResponse response = new MockHttpServletResponse();
    	request.setAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE, "index.js");
        controller.loadAsset(request, response);
        assertEquals(response.getContentType(), "application/javascript");
        assertEquals("console.log('hello')\n", response.getContentAsString()); // \n should not be there, but is not a mess
        tempResource.delete();
    }
    @Test
    public void testLoadAssetImageFromDataDir() throws IOException {
    	File dataDir = TestUtils.getDataDir();
        File tempResource = TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/index.js"), dataDir, "index.js");
        controller.setDataDir(dataDir.getAbsolutePath());
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        String resource = new String(controller.loadAsset("index.js"), "UTF-8");
        assertEquals("console.log('hello')", resource.trim());
        tempResource.delete();
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
        File tempResource = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfig.json");
        File tempPatch = TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/pluginsConfig.json.patch"), dataDir,
                "/pluginsConfig.json.patch");
        ServletContext context = Mockito.mock(ServletContext.class);
        Mockito.when(context.getRealPath(Mockito.endsWith(".json"))).thenReturn(tempResource.getAbsolutePath());
        controller.setContext(context);
        String resource = new String(controller.loadResource("pluginsConfig", true), "UTF-8");
        assertEquals("{\"plugins\":[{\"name\":\"My\",\"dependencies\":[\"Toolbar\"],\"extension\":true}]}", resource.trim());
        tempResource.delete();
        tempPatch.delete();
    }
}
