/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
package it.geosolutions.mapstore.utils;


import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.IOException;
import java.util.Optional;

import javax.servlet.ServletContext;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

import it.geosolutions.mapstore.ConfigControllerTest;
import it.geosolutions.mapstore.TestUtils;

public class ResourceUtilsTest {
    
    @Before
    public void setUp() {
        
    }
    
    @Test
    public void testFindResource() throws IOException {
    	ServletContext context = Mockito.mock(ServletContext.class);
    	File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfig.json");
        Mockito.when(context.getRealPath(Mockito.endsWith("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
    	Optional<File> f1 = ResourceUtils.findResource("", context, "pluginsConfig.json");
    	Optional<File> f2 = ResourceUtils.findResource("", context, "otherFile.json");
    	assertTrue(f1.isPresent());
    	assertFalse(f2.isPresent());
    }
    @Test
    public void testFindResourceDoNotAllowAbsolutePaths() throws IOException {
    	ServletContext context = Mockito.mock(ServletContext.class);
    	File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfig.json");
    	Optional<File> f1 = ResourceUtils.findResource("", context, tempConfig.getAbsolutePath()); // "/tmp/something"
    	Optional<File> f2 = ResourceUtils.findResource("", context, tempConfig.getAbsolutePath().substring(1)); // "tmp/something"
    	assertFalse(f1.isPresent());
    	assertFalse(f2.isPresent());
    }
    
   
}
