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

import it.geosolutions.mapstore.controllers.extensions.ExtensionsController;

public class ExtensionsControllerTest {
    ExtensionsController controller;

    @Before
    public void setUp() {
        controller = new ExtensionsController();
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
    	MockHttpServletRequest request = new MockHttpServletRequest("GET", "/extensions//index.js");
    	MockHttpServletResponse response = new MockHttpServletResponse();
    	request.setAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE, "/extensions/");
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
    public void testDirectoryTraversingIsNotAllowed() throws IOException {
    	ServletContext context = Mockito.mock(ServletContext.class);
        File tempResource = TestUtils.copyToTemp(ConfigControllerTest.class, "/index.js");
        Mockito.when(context.getRealPath(Mockito.anyString())).thenReturn(tempResource.getAbsolutePath());
        controller.setContext(context);
    	MockHttpServletRequest request = new MockHttpServletRequest("GET", "/extensions/../index.js");
    	MockHttpServletResponse response = new MockHttpServletResponse();
    	request.setAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE, "/extensions/");
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
        File tempResource = TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/index.js"), dataDir, "/extensions/SomeExtension/index.js");
        controller.setDataDir(dataDir.getAbsolutePath());
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "SomeExtension/index.js");
    	MockHttpServletResponse response = new MockHttpServletResponse();
    	request.setAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE, "SomeExtension/index.js");
        controller.loadAsset(request, response);
        assertEquals(response.getContentType(), "application/javascript");
        assertEquals("console.log('hello')\n", response.getContentAsString()); // \n should not be there, but is not a mess
        tempResource.delete();
    }
    @Test
    public void testLoadAssetImageFromDataDir() throws IOException {
    	File dataDir = TestUtils.getDataDir();
        File tempResource = TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/test.jpg"), dataDir, "/extensions/SomeExtension/test.jpg");
        controller.setDataDir(dataDir.getAbsolutePath());
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "SomeExtension/test.jpg");
    	MockHttpServletResponse response = new MockHttpServletResponse();
    	request.setAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE, "SomeExtension/test.jpg");
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

}
