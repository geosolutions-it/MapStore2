/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
package it.geosolutions.mapstore;

import it.geosolutions.mapstore.controllers.rest.config.UploadPluginController;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.mockito.stubbing.Answer;

import javax.servlet.ServletContext;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

public class UploadPluginControllerTest {
    UploadPluginController controller;

    @Before
    public void setUp() {
        controller = new UploadPluginController();
        controller.setPluginsConfigAsPatch(false);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testUninstallPluginWithInvalidNamePathTraversal() throws IOException {
        controller.uninstallPlugin("../outside");
    }

    @Test(expected = IllegalArgumentException.class)
    public void testUninstallPluginWithBackslashInName() throws IOException {
        controller.uninstallPlugin("some\\invalidplugin");
    }

    @Test
    public void testUninstallPluginPathNormalization() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfigWithPlugin.json");
        Mockito.when(context.getRealPath(Mockito.contains("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class, "/extensionsWithPlugin.json");
        File tempDist = TestUtils.getDataDir();

        // Mock a legitimate folder inside the base directory
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.contains("My"))).thenAnswer(
                (Answer<String>) invocation -> {
                    String path = (String) invocation.getArguments()[0];
                    return tempDist.getAbsolutePath() + File.separator + path;
                });

        // Set up a plugin folder in a normalized path within the base directory
        File pluginFolder = new File(tempDist.getAbsolutePath() + File.separator + "extensions" + File.separator + "My");
        pluginFolder.mkdirs();
        assertTrue(pluginFolder.exists());
        TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/index.js"), pluginFolder, "index.js");

        // Attempt to uninstall to check normalized paths remain within base
        String result = controller.uninstallPlugin("My");
        assertEquals("{\"bundle\":\"My/index.js\",\"translations\":\"My/translations\"}", result);
        assertFalse(pluginFolder.exists());
        tempConfig.delete();
        tempExtensions.delete();
    }

    @Test
    public void testUploadValidBundle() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfig.json");
        Mockito.when(context.getRealPath(Mockito.endsWith("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class, "/extensions.json");
        File tempDist = TestUtils.getDataDir();
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.contains("My"))).thenAnswer(
                (Answer<String>) invocation -> {
                    String path = (String) invocation.getArguments()[0];
                    return tempDist.getAbsolutePath() + File.separator + path;
                });
        InputStream zipStream = UploadPluginControllerTest.class.getResourceAsStream("/plugin.zip");
        String result = controller.uploadPlugin(zipStream);
        assertEquals("{\"name\":\"My\",\"dependencies\":[\"Toolbar\"],\"extension\":true}", result);
        String extensions = TestUtils.getContent(tempExtensions);
        assertEquals("{\"My\":{\"bundle\":\"My/index.js\",\"translations\":\"My/translations\"}}", extensions);
        tempConfig.delete();
        tempExtensions.delete();
    }

    @Test
    public void testUploadValidBundleReplace() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfigWithPlugin.json");
        Mockito.when(context.getRealPath(Mockito.endsWith("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class, "/extensionsWithPlugin.json");
        File tempDist = TestUtils.getDataDir();
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.contains("My"))).thenAnswer(
                (Answer<String>) invocation -> {
                    String path = (String) invocation.getArguments()[0];
                    return tempDist.getAbsolutePath() + File.separator + path;
                });
        InputStream zipStream = UploadPluginControllerTest.class.getResourceAsStream("/plugin.zip");
        String result = controller.uploadPlugin(zipStream);
        assertEquals("{\"name\":\"My\",\"dependencies\":[\"Toolbar\"],\"extension\":true}", result);
        String extensions = TestUtils.getContent(tempExtensions);
        assertEquals("{\"My\":{\"bundle\":\"My/index.js\",\"translations\":\"My/translations\"}}", extensions);
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
        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfig.json");
        Mockito.when(context.getRealPath(Mockito.endsWith("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.endsWith(".patch"))).thenReturn(tempDir.getAbsolutePath() + "/pluginsConfig.json.patch");
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class, "/extensions.json");
        File tempDist = TestUtils.getDataDir();
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.contains("dist/extensions/"))).thenAnswer(
                (Answer<String>) invocation -> {
                    String path = (String) invocation.getArguments()[0];
                    return tempDist.getAbsolutePath() + File.separator + path.substring("dist/extensions/".length());
                });
        InputStream zipStream = UploadPluginControllerTest.class.getResourceAsStream("/plugin.zip");
        String result = controller.uploadPlugin(zipStream);
        assertEquals("{\"name\":\"My\",\"dependencies\":[\"Toolbar\"],\"extension\":true}", result);
        String pluginsPatch = TestUtils.getContent(new File(tempDir.getAbsolutePath() + File.separator + "configs" + File.separator + "pluginsConfig.json.patch"));
        assertEquals("[{\"op\":\"add\",\"path\":\"/plugins/-\",\"value\":{\"name\":\"My\",\"dependencies\":[\"Toolbar\"],\"extension\":true}}]", pluginsPatch);
        tempConfig.delete();
        tempExtensions.delete();
    }

    @Test
    public void testCustomBundlesPath() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfig.json");
        Mockito.when(context.getRealPath(Mockito.endsWith("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class, "/extensions.json");
        File tempDist = TestUtils.getDataDir();
        controller.setBundlesPath("custom");
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.contains("custom/"))).thenAnswer(
                (Answer<String>) invocation -> {
                    String path = (String) invocation.getArguments()[0];
                    return tempDist.getAbsolutePath() + File.separator + path.substring("custom/".length());
                });
        InputStream zipStream = UploadPluginControllerTest.class.getResourceAsStream("/plugin.zip");
        controller.uploadPlugin(zipStream);
        assertTrue(new File(tempDist.getAbsolutePath() + File.separator + "My" + File.separator + "index.js").exists());
        tempConfig.delete();
        tempExtensions.delete();
    }

    @Test
    public void testUploadInvalidBundle() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfig.json");
        Mockito.when(context.getRealPath(Mockito.contains("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class, "/extensions.json");
        File tempDist = TestUtils.getDataDir();
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.contains("/extensions/"))).thenAnswer(
                (Answer<String>) invocation -> {
                    String path = (String) invocation.getArguments()[0];
                    return tempDist.getAbsolutePath() + File.separator + path.substring("dist/extensions/".length());
                });
        InputStream zipStream = UploadPluginControllerTest.class.getResourceAsStream("/invalid.zip");
        try {
            controller.uploadPlugin(zipStream);
            fail();
        } catch (Throwable e) {
            assertNotNull(e);
        }

    }

    @Test
    public void testUploadValidBundleWithDataDir() throws IOException {
        File dataDir = TestUtils.getDataDir();
        controller.setDataDir(dataDir.getAbsolutePath());
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        File tempConfig = TestUtils.copyTo(UploadPluginControllerTest.class.getResourceAsStream("/pluginsConfig.json"), dataDir, "/configs/pluginsConfig.json");
        File tempExtensions = TestUtils.copyTo(UploadPluginControllerTest.class.getResourceAsStream("/extensions.json"), dataDir, "/extensions/extensions.json");
        InputStream zipStream = UploadPluginControllerTest.class.getResourceAsStream("/plugin.zip");
        controller.uploadPlugin(zipStream);
        assertTrue(new File(dataDir.getAbsolutePath() + File.separator + "extensions" + File.separator + "My" + File.separator + "index.js").exists());
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
                dataDir2, "configs/pluginsConfig.json");
        File tempExtensions = TestUtils.copyTo(
                UploadPluginControllerTest.class.getResourceAsStream("/extensions.json"), dataDir2,
                "extensions/extensions.json");
        InputStream zipStream = UploadPluginControllerTest.class.getResourceAsStream("/plugin.zip");
        controller.uploadPlugin(zipStream);
        // we save to dataDir1
        assertTrue(new File(dataDir1.getAbsolutePath() + File.separator + "extensions" + File.separator + "My" + File.separator + "index.js").exists());
        tempConfig.delete();
        tempExtensions.delete();
    }

    @Test
    public void testUninstallPlugin() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);
        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfigWithPlugin.json");
        Mockito.when(context.getRealPath(Mockito.contains("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class, "/extensionsWithPlugin.json");
        File tempDist = TestUtils.getDataDir();
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());
        Mockito.when(context.getRealPath(Mockito.contains("My"))).thenAnswer(
                (Answer<String>) invocation -> {
                    String path = (String) invocation.getArguments()[0];
                    return tempDist.getAbsolutePath() + File.separator + path;
                });
        File pluginFolder = new File(tempDist.getAbsolutePath() + File.separator + "extensions" + File.separator + "My");
        pluginFolder.mkdirs();
        assertTrue(pluginFolder.exists());
        TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/index.js"), pluginFolder, "index.js");
        String result = controller.uninstallPlugin("My");
        assertEquals("{\"bundle\":\"My/index.js\",\"translations\":\"My/translations\"}", result);
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
        File tempConfig = TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/pluginsConfig.json.patch"), dataDir, "/configs/pluginsConfig.json.patch");
        File tempExtensions = TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/extensionsWithPlugin.json"), dataDir, "/extensions/extensions.json");
        File pluginFolder = new File(dataDir.getAbsolutePath() + File.separator + "extensions" + File.separator + "My");
        pluginFolder.mkdirs();
        assertTrue(pluginFolder.exists());
        TestUtils.copyTo(ConfigControllerTest.class.getResourceAsStream("/index.js"), pluginFolder, "myplugin.js");
        String result = controller.uninstallPlugin("My");
        assertEquals("{\"bundle\":\"My/index.js\",\"translations\":\"My/translations\"}", result);
        String extensions = TestUtils.getContent(tempExtensions);
        assertEquals("{}", extensions);
        String plugins = TestUtils.getContent(tempConfig);
        assertEquals("[]", plugins);
        assertFalse(pluginFolder.exists());
        tempConfig.delete();
        tempExtensions.delete();
    }

    // ---------------------------------------------------------------------
    // NEW: CWE-23 / Zip-Slip hardening tests (do not modify existing tests)
    // ---------------------------------------------------------------------

    @Test(expected = SecurityException.class)
    public void testUploadBlocksZipSlip_DotDotInAssets() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);

        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfig.json");
        Mockito.when(context.getRealPath(Mockito.endsWith("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class, "/extensions.json");
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());

        File tempDist = TestUtils.getDataDir();
        Mockito.when(context.getRealPath(Mockito.contains("dist/extensions/"))).thenAnswer(
                (Answer<String>) invocation -> {
                    String path = (String) invocation.getArguments()[0];
                    return tempDist.getAbsolutePath() + File.separator + path.substring("dist/extensions/".length());
                });

        Map<String, byte[]> extras = new HashMap<>();
        extras.put("assets/../../evil.js", "x".getBytes(StandardCharsets.UTF_8));

        InputStream zip = makePluginZip("My", "index.js", extras);
        controller.uploadPlugin(zip); // expect SecurityException
    }

    @Test(expected = SecurityException.class)
    public void testUploadBlocksZipSlip_AbsoluteUnixEntry() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);

        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfig.json");
        Mockito.when(context.getRealPath(Mockito.endsWith("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class, "/extensions.json");
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());

        File tempDist = TestUtils.getDataDir();
        Mockito.when(context.getRealPath(Mockito.contains("dist/extensions/"))).thenReturn(
                tempDist.getAbsolutePath() + File.separator + "ignored"
        );

        Map<String, byte[]> extras = new HashMap<>();
        extras.put("/etc/passwd", "root:x:0:0".getBytes(StandardCharsets.UTF_8));

        InputStream zip = makePluginZip("My", "index.js", extras);
        controller.uploadPlugin(zip); // expect SecurityException
    }

    @Test(expected = SecurityException.class)
    public void testUploadBlocksZipSlip_WindowsDriveEntry() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);

        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfig.json");
        Mockito.when(context.getRealPath(Mockito.endsWith("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class, "/extensions.json");
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());

        Map<String, byte[]> extras = new HashMap<>();
        extras.put("C:\\evil.js", "drv".getBytes(StandardCharsets.UTF_8));

        InputStream zip = makePluginZip("My", "index.js", extras);
        controller.uploadPlugin(zip); // expect SecurityException
    }

    @Test(expected = SecurityException.class)
    public void testUploadBlocksZipSlip_BackslashTraversalInAssets() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);

        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfig.json");
        Mockito.when(context.getRealPath(Mockito.endsWith("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class, "/extensions.json");
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());

        File tempDist = TestUtils.getDataDir();
        Mockito.when(context.getRealPath(Mockito.contains("dist/extensions/"))).thenAnswer(
                (Answer<String>) invocation -> {
                    String path = (String) invocation.getArguments()[0];
                    return tempDist.getAbsolutePath() + File.separator + path.substring("dist/extensions/".length());
                });

        Map<String, byte[]> extras = new HashMap<>();
        extras.put("assets\\..\\..\\evil.js", "y".getBytes(StandardCharsets.UTF_8));

        InputStream zip = makePluginZip("My", "index.js", extras);
        controller.uploadPlugin(zip); // expect SecurityException
    }

    @Test(expected = SecurityException.class)
    public void testUploadBlocksZipSlip_TraversalInBundleName() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);

        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfig.json");
        Mockito.when(context.getRealPath(Mockito.endsWith("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class, "/extensions.json");
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());

        Map<String, byte[]> extras = new HashMap<>();
        // no extra assets needed; bundle name itself is malicious
        InputStream zip = makePluginZip("My", "../index.js", extras);
        controller.uploadPlugin(zip); // expect SecurityException
    }

    @Test
    public void testUploadAllowsNestedAssets() throws IOException {
        ServletContext context = Mockito.mock(ServletContext.class);
        controller.setContext(context);

        File tempConfig = TestUtils.copyToTemp(ConfigControllerTest.class, "/pluginsConfig.json");
        Mockito.when(context.getRealPath(Mockito.endsWith("pluginsConfig.json"))).thenReturn(tempConfig.getAbsolutePath());
        File tempExtensions = TestUtils.copyToTemp(ConfigControllerTest.class, "/extensions.json");
        Mockito.when(context.getRealPath(Mockito.contains("extensions.json"))).thenReturn(tempExtensions.getAbsolutePath());

        final File tempDist = TestUtils.getDataDir();

        // Cover both likely extension roots
        Mockito.when(context.getRealPath(Mockito.contains("dist/extensions/"))).thenAnswer(
                (Answer<String>) inv -> {
                    String path = (String) inv.getArguments()[0];
                    return tempDist.getAbsolutePath() + File.separator + path.substring("dist/extensions/".length());
                });
        Mockito.when(context.getRealPath(Mockito.contains("extensions/"))).thenAnswer(
                (Answer<String>) inv -> {
                    String path = (String) inv.getArguments()[0];
                    return tempDist.getAbsolutePath() + File.separator + path.substring("extensions/".length());
                });

        // Fallback for write mode when specific realPath is not stubbed
        Mockito.when(context.getRealPath("")).thenReturn(tempDist.getAbsolutePath());

        // Build a valid plugin ZIP with a nested asset
        Map<String, byte[]> extras = new java.util.HashMap<>();
        extras.put("assets/i18n/it.json", "{\"ok\":true}".getBytes(java.nio.charset.StandardCharsets.UTF_8));

        InputStream zip = makePluginZip("My", "index.js", extras);
        String result = controller.uploadPlugin(zip);
        assertEquals("{\"name\":\"My\",\"dependencies\":[\"Toolbar\"],\"extension\":true}", result);

        // Accept any of the legitimate destinations
        File expected1 = new File(tempDist, "My" + File.separator + "assets" + File.separator + "i18n" + File.separator + "it.json");
        File expected2 = new File(tempDist, "extensions" + File.separator + "My" + File.separator + "assets" + File.separator + "i18n" + File.separator + "it.json");
        File expected3 = new File(tempDist, "dist" + File.separator + "extensions" + File.separator + "My" + File.separator + "assets" + File.separator + "i18n" + File.separator + "it.json");

        assertTrue("Expected nested asset to be written",
                expected1.exists() || expected2.exists() || expected3.exists());

        tempConfig.delete();
        tempExtensions.delete();
        // best-effort cleanup
        if (expected1.exists()) expected1.delete();
        if (expected2.exists()) expected2.delete();
        if (expected3.exists()) expected3.delete();
    }

    // ------------------------------
    // Helpers for in-memory ZIP data
    // ------------------------------

    private static InputStream makePluginZip(String pluginName, String bundleEntryName, Map<String, byte[]> extras) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(bos)) {
            // index.js (bundle) – can be in subfolders per the provided name
            putZipEntry(zos, bundleEntryName, "console.log('ok');".getBytes(StandardCharsets.UTF_8));

            // index.json
            String json = "{\"plugins\":[{\"name\":\"" + pluginName + "\",\"dependencies\":[\"Toolbar\"]}]}";
            putZipEntry(zos, "index.json", json.getBytes(StandardCharsets.UTF_8));

            // extras
            if (extras != null) {
                for (Map.Entry<String, byte[]> e : extras.entrySet()) {
                    putZipEntry(zos, e.getKey(), e.getValue());
                }
            }
        }
        return new ByteArrayInputStream(bos.toByteArray());
    }

    private static void putZipEntry(ZipOutputStream zos, String name, byte[] content) throws IOException {
        ZipEntry ze = new ZipEntry(name);
        zos.putNextEntry(ze);
        if (content != null && content.length > 0) {
            zos.write(content);
        }
        zos.closeEntry();
    }
}
