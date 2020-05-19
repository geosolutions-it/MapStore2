/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
package it.geosolutions.mapstore;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import javax.servlet.ServletContext;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;

public class UploadPluginControllerTest {
    UploadPluginController controller;
    
    @Before
    public void setUp() {
        controller = new UploadPluginController();
        controller.setPluginsConfigAsPatch(false);
    }
    
    @Test
    public void testUploadValidBundle() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class.getResourceAsStream("/pluginsConfig.json"));
        Mockito.when(context.getRealPath(Mockito.endsWith("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class.getResourceAsStream("/extensions.json"));
        File tempDist = TestUtils.getDataDir();
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.contains("dist/extensions/"))).thenAnswer(new Answer<String>() {

            @Override
            public String answer(InvocationOnMock invocation) throws Throwable {
                String path = (String)invocation.getArguments()[0];
                return tempDist.getAbsolutePath()  + File.separator + path.substring("dist/extensions/".length());
            }
            
        });
        InputStream zipStream = UploadPluginControllerTest.class.getResourceAsStream("/plugin.zip");
        String result = controller.uploadPlugin(zipStream);
        assertEquals("{\"name\":\"My\",\"dependencies\":[\"Toolbar\"],\"extension\":true}", result);
        String extensions = TestUtils.getContent(tempExtensions);
        assertEquals("{\"MyPlugin\":{\"bundle\":\"dist/extensions/My/myplugin.js\",\"translations\":\"dist/extensions/My/translations\"}}", extensions);
        tempConfig.delete();
        tempExtensions.delete();
    }
    
    @Test
    public void testUploadValidBundleReplace() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class.getResourceAsStream("/pluginsConfigWithPlugin.json"));
        Mockito.when(context.getRealPath(Mockito.endsWith("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class.getResourceAsStream("/extensionsWithPlugin.json"));
        File tempDist = TestUtils.getDataDir();
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.contains("dist/extensions/"))).thenAnswer(new Answer<String>() {

            @Override
            public String answer(InvocationOnMock invocation) throws Throwable {
                String path = (String)invocation.getArguments()[0];
                return tempDist.getAbsolutePath()  + File.separator + path.substring("dist/extensions/".length());
            }
            
        });
        InputStream zipStream = UploadPluginControllerTest.class.getResourceAsStream("/plugin.zip");
        String result = controller.uploadPlugin(zipStream);
        assertEquals("{\"name\":\"My\",\"dependencies\":[\"Toolbar\"],\"extension\":true}", result);
        String extensions = TestUtils.getContent(tempExtensions);
        assertEquals("{\"MyPlugin\":{\"bundle\":\"dist/extensions/My/myplugin.js\",\"translations\":\"dist/extensions/My/translations\"}}", extensions);
        tempConfig.delete();
        tempExtensions.delete();
    }
    
    @Test
    public void testUploadValidBundleUsingPatch() throws IOException {
        controller.setPluginsConfigAsPatch(true);
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        File tempDir = TestUtils.getDataDir();
        controller.setDataDir(tempDir.getAbsolutePath());
        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class.getResourceAsStream("/pluginsConfig.json"));
        Mockito.when(context.getRealPath(Mockito.endsWith("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.endsWith(".patch"))).thenReturn(tempDir.getAbsolutePath() + "/pluginsConfig.json.patch");
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class.getResourceAsStream("/extensions.json"));
        File tempDist = TestUtils.getDataDir();
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.contains("dist/extensions/"))).thenAnswer(new Answer<String>() {

            @Override
            public String answer(InvocationOnMock invocation) throws Throwable {
                String path = (String)invocation.getArguments()[0];
                return tempDist.getAbsolutePath()  + File.separator + path.substring("dist/extensions/".length());
            }
            
        });
        InputStream zipStream = UploadPluginControllerTest.class.getResourceAsStream("/plugin.zip");
        String result = controller.uploadPlugin(zipStream);
        assertEquals("{\"name\":\"My\",\"dependencies\":[\"Toolbar\"],\"extension\":true}", result);
        String pluginsPatch = TestUtils.getContent(new File(tempDir.getAbsolutePath() + "/pluginsConfig.json.patch"));
        assertEquals("[{\"op\":\"add\",\"path\":\"/plugins/-\",\"value\":{\"name\":\"My\",\"dependencies\":[\"Toolbar\"],\"extension\":true}}]", pluginsPatch);
        tempConfig.delete();
        tempExtensions.delete();
    }
    
    @Test
    public void testCustomBundlesPath() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class.getResourceAsStream("/pluginsConfig.json"));
        Mockito.when(context.getRealPath(Mockito.endsWith("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class.getResourceAsStream("/extensions.json"));
        File tempDist = TestUtils.getDataDir();
        controller.setBundlesPath("custom");
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.contains("custom/"))).thenAnswer(new Answer<String>() {

            @Override
            public String answer(InvocationOnMock invocation) throws Throwable {
                String path = (String)invocation.getArguments()[0];
                return tempDist.getAbsolutePath() + File.separator + path.substring("custom/".length());
            }
            
        });
        InputStream zipStream = UploadPluginControllerTest.class.getResourceAsStream("/plugin.zip");
        controller.uploadPlugin(zipStream);
        assertTrue(new File(tempDist.getAbsolutePath() + File.separator + "My" + File.separator + "myplugin.js").exists());
        tempConfig.delete();
        tempExtensions.delete();
    }
    
    @Test
    public void testUploadInvalidBundle() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class.getResourceAsStream("/pluginsConfig.json"));
        Mockito.when(context.getRealPath(Mockito.contains("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class.getResourceAsStream("/extensions.json"));
        File tempDist = TestUtils.getDataDir();
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.contains("dist/extensions/"))).thenAnswer(new Answer<String>() {

            @Override
            public String answer(InvocationOnMock invocation) throws Throwable {
                String path = (String)invocation.getArguments()[0];
                return tempDist.getAbsolutePath()  + File.separator + path.substring("dist/extensions/".length());
            }
            
        });
        InputStream zipStream = UploadPluginControllerTest.class.getResourceAsStream("/invalid.zip");
        try {
            controller.uploadPlugin(zipStream);
            fail();
        } catch(IOException e) {
            assertNotNull(e);
        }
        
    }
    
    @Test
    public void testUploadValidBundleWithDataDir() throws IOException {
    	File dataDir = TestUtils.getDataDir();
        controller.setDataDir(dataDir.getAbsolutePath());
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        File tempConfig = TestUtils.copyTo(UploadPluginControllerTest.class.getResourceAsStream("/pluginsConfig.json"), dataDir, "pluginsConfig.json");
        File tempExtensions = TestUtils.copyTo(UploadPluginControllerTest.class.getResourceAsStream("/extensions.json"), dataDir, "extensions.json");
        InputStream zipStream = UploadPluginControllerTest.class.getResourceAsStream("/plugin.zip");
        controller.uploadPlugin(zipStream);
        assertTrue(new File(dataDir.getAbsolutePath() + File.separator + "dist" + File.separator + "extensions" + File.separator + "My" + File.separator + "myplugin.js").exists());
        tempConfig.delete();
        tempExtensions.delete();
    }

    @Test
    public void testUploadValidBundleWithMultipleDataDir() throws IOException {
        File dataDir1 = TestUtils.getDataDir();
        File dataDir2 = TestUtils.getDataDir();
        controller.setDataDir(dataDir1.getAbsolutePath() + "," + dataDir2.getAbsolutePath());
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        // we load from dataDir2 (less priority)
        File tempConfig = TestUtils.copyTo(
                UploadPluginControllerTest.class.getResourceAsStream("/pluginsConfig.json"),
                dataDir2, "pluginsConfig.json");
        File tempExtensions = TestUtils.copyTo(
                UploadPluginControllerTest.class.getResourceAsStream("/extensions.json"), dataDir2,
                "extensions.json");
        InputStream zipStream = UploadPluginControllerTest.class.getResourceAsStream("/plugin.zip");
        controller.uploadPlugin(zipStream);
        // we save to dataDir1
        assertTrue(new File(dataDir1.getAbsolutePath() + File.separator + "dist" + File.separator
                + "extensions" + File.separator + "My" + File.separator + "myplugin.js").exists());
        tempConfig.delete();
        tempExtensions.delete();
    }

    @Test
    public void testUninstallPlugin() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class.getResourceAsStream("/pluginsConfigWithPlugin.json"));
        Mockito.when(context.getRealPath(Mockito.contains("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class.getResourceAsStream("/extensionsWithPlugin.json"));
        File tempDist = TestUtils.getDataDir();
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.contains("dist/extensions/"))).thenAnswer(new Answer<String>() {

            @Override
            public String answer(InvocationOnMock invocation) throws Throwable {
                String path = (String)invocation.getArguments()[0];
                return tempDist.getAbsolutePath()  + File.separator + path.substring("dist/extensions/".length());
            }
            
        });
        File pluginFolder = new File(tempDist.getAbsolutePath() + File.separator + "My");
        pluginFolder.mkdirs();
        assertTrue(pluginFolder.exists());
        TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/bundle.js"), pluginFolder, "myplugin.js");
        String result = controller.uninstallPlugin("My");
        assertEquals("{\"bundle\":\"dist/extensions/My/bundle.js\",\"translations\":\"dist/extensions/My/translations\"}", result);
        String extensions = TestUtils.getContent(tempExtensions);
        assertEquals("{}", extensions);
        String plugins = TestUtils.getContent(tempConfig);
        assertEquals("{\"plugins\":[]}", plugins);
        assertFalse(pluginFolder.exists());
        tempConfig.delete();
        tempExtensions.delete();
    }
    
    @Test
    public void testUninstallPluginWithPatch() throws IOException {
        controller.setPluginsConfigAsPatch(true);
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        File dataDir = TestUtils.getDataDir();
        controller.setDataDir(dataDir.getAbsolutePath());
        File tempConfig = TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/pluginsConfig.json.patch"), dataDir, "pluginsConfig.json.patch");
        File tempExtensions = TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/extensionsWithPlugin.json"), dataDir, "extensions.json");
        File pluginFolder = new File(dataDir.getAbsolutePath() + File.separator + "dist" + File.separator + "extensions" + File.separator + "My");
        pluginFolder.mkdirs();
        assertTrue(pluginFolder.exists());
        TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/bundle.js"), pluginFolder, "myplugin.js");
        String result = controller.uninstallPlugin("My");
        assertEquals("{\"bundle\":\"dist/extensions/My/bundle.js\",\"translations\":\"dist/extensions/My/translations\"}", result);
        String extensions = TestUtils.getContent(tempExtensions);
        assertEquals("{}", extensions);
        String plugins = TestUtils.getContent(tempConfig);
        assertEquals("[]", plugins);
        assertFalse(pluginFolder.exists());
        tempConfig.delete();
        tempExtensions.delete();
    }
}
