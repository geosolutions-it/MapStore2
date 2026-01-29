/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
package it.geosolutions.mapstore.controllers.rest.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import it.geosolutions.mapstore.controllers.BaseMapStoreController;
import it.geosolutions.mapstore.utils.ResourceUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.ServletContext;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * REST service used to upload (install) or uninstall extensions.
 * When a plugin is installed, this class takes care of :
 * - Storing the data in the proper folder (data-dir or webapp), in `extensionsFolder`.
 * - Modifying `pluginsConfig.json` and `extensions.json` (in `extensionsFolder). to include the new plugin.
 * - When a datadir is available, the pluginsConfig.json original file is not touched, a `pluginsConfig.json.patch` file is used instead
 * in json-patch format to list only the uploaded extensions.
 * On uninstall, the class will clean up the files and the directories above to remove the plugins.
 * TODO: move this in extensions package (and services path, aligning the client)
 */
@Controller
public class UploadPluginController extends BaseMapStoreController {

    private static final String PLUGIN_PATH_PREFIX = "__PLUGIN__/";

    private final ObjectMapper jsonMapper = new ObjectMapper();
    private final JsonNodeFactory jsonNodeFactory = new JsonNodeFactory(false);

    @Autowired
    ServletContext context;

    /**
     * Stores an uploaded plugin zip bundle.
     */
    @Secured({"ROLE_ADMIN"})
    @RequestMapping(value = "/uploadPlugin", method = RequestMethod.POST, headers = "Accept=application/json")
    public @ResponseBody String uploadPlugin(InputStream dataStream) throws IOException {
        try (ZipInputStream zip = new ZipInputStream(dataStream)) {
            ZipEntry entry = zip.getNextEntry();
            String pluginName = null;
            String bundleEntryName = null; // as found inside the zip (normalized, POSIX)
            Map<File, String> tempFilesToRelativeTargets = new HashMap<>(); // File -> relative path under extensions root (POSIX)
            JsonNode plugin = null;
            boolean addTranslations = false;

            while (entry != null) {
                if (!entry.isDirectory()) {
                    // Normalize and validate the entry name ONCE (always POSIX '/')
                    final String normalizedEntry = normalizeZipEntryName(entry.getName());
                    final String lower = normalizedEntry.toLowerCase(Locale.ROOT);

                    if (lower.endsWith("index.js")) {
                        bundleEntryName = normalizedEntry;
                        File tempBundle = File.createTempFile("mapstore-bundle", ".js");
                        storeAsset(zip, tempBundle);
                        // We'll resolve final relative target after we know pluginName
                        tempFilesToRelativeTargets.put(tempBundle, "__BUNDLE__");
                    } else if (lower.equals("index.json")) {
                        JsonNode json = readJSON(zip);
                        JsonNode plugins = json.get("plugins");
                        if (plugins == null || !plugins.isArray() || plugins.isEmpty()) {
                            throw new IOException("Invalid bundle: index.json has no 'plugins' array");
                        }
                        // TODO: add support for many plugins in one single extension
                        plugin = plugins.get(0);
                        ((ObjectNode) plugin).put("extension", true);

                        pluginName = plugin.get("name").asText();
                        validatePluginName(pluginName); // SECURITY: ensure folder-safe name

                        if (shouldStorePluginsConfigAsPatch()) {
                            addPluginConfigurationAsPatch(plugin);
                        } else {
                            addPluginConfiguration(plugin);
                        }
                    } else if (lower.startsWith("translations/")) {
                        File tempAsset = File.createTempFile("mapstore-asset-translations", ".json");
                        storeAsset(zip, tempAsset);
                        // Target relative to extensions root: <pluginName>/<translations/...>
                        tempFilesToRelativeTargets.put(tempAsset, PLUGIN_PATH_PREFIX + normalizedEntry);
                        addTranslations = true;
                    } else if (lower.startsWith("assets/")) {
                        File tempAsset = File.createTempFile("mapstore-asset", ".tmp");
                        storeAsset(zip, tempAsset);
                        // Target relative to extensions root: <pluginName>/<assets/...>
                        tempFilesToRelativeTargets.put(tempAsset, PLUGIN_PATH_PREFIX + normalizedEntry);
                    }
                }
                entry = zip.getNextEntry();
            }

            if (plugin == null) {
                throw new IOException("Invalid bundle: index.json missing");
            }
            if (bundleEntryName == null) {
                throw new IOException("Invalid bundle: index.js missing");
            }

            // Build pluginBundle path (relative to extensions root) SAFELY in POSIX form:
            // <pluginName>/<bundleEntryName>
            String pluginBundleRelative = joinUnixStrict(pluginName, bundleEntryName);

            String translationsDirRelative = addTranslations ? joinUnixStrict(pluginName, "translations") : null;

            // Write extensions.json entry (POSIX paths in JSON)
            addExtension(pluginName, pluginBundleRelative, translationsDirRelative);

            // Move temp files to their final SAFE locations
            for (Map.Entry<File, String> e : tempFilesToRelativeTargets.entrySet()) {
                File tempFile = e.getKey();
                String markerOrRel = e.getValue();

                String relativeTarget;
                if ("__BUNDLE__".equals(markerOrRel)) {
                    relativeTarget = pluginBundleRelative;
                } else if (markerOrRel.startsWith(PLUGIN_PATH_PREFIX)) {
                    String sub = markerOrRel.substring(PLUGIN_PATH_PREFIX.length());
                    relativeTarget = joinUnixStrict(pluginName, sub);
                } else {
                    // Should never happen, but don't proceed silently
                    throw new IOException("Unexpected target marker: " + markerOrRel);
                }

                moveAsset(tempFile, relativeTarget);
            }

            return plugin.toString();
        }
    }

    private static void validatePluginName(String pluginName) {
        if (pluginName == null || pluginName.isEmpty() || !pluginName.matches("^[A-Za-z0-9._-]+$")) {
            throw new IllegalArgumentException("Invalid plugin name.");
        }
    }

    /**
     * Normalize a zip entry name to a safe POSIX-relative path (no absolute, no “..”).
     */
    private static String normalizeZipEntryName(String entryName) {
        if (entryName == null) throw new SecurityException("Null zip entry");
        String unix = entryName.replace('\\', '/');

        // Reject absolute or drive-like
        if (unix.startsWith("/") || unix.matches("^[A-Za-z]:.*")) {
            throw new SecurityException("Zip entry is absolute: " + entryName);
        }

        String[] parts = unix.split("/");
        java.util.Deque<String> stack = new java.util.ArrayDeque<>();
        for (String seg : parts) {
            if (seg.isEmpty() || ".".equals(seg)) continue;
            if ("..".equals(seg)) {
                throw new SecurityException("Zip entry attempts path traversal: " + entryName);
            }
            stack.addLast(seg);
        }
        return String.join("/", stack);
    }

    /**
     * POSIX-safe join of two relative segments (no absolute, no traversal).
     */
    private static String joinUnixStrict(String left, String right) {
        String a = left == null ? "" : left.replace('\\', '/');
        String b = right == null ? "" : right.replace('\\', '/');
        if (b.startsWith("/")) throw new SecurityException("Absolute component not allowed");
        if (b.contains("..")) throw new SecurityException("Traversal not allowed: " + b);
        if (a.endsWith("/")) a = a.substring(0, a.length() - 1);
        return a.isEmpty() ? b : a + "/" + b;
    }

    private boolean shouldStorePluginsConfigAsPatch() {
        // we use patch files only if we have a datadir
        return getPluginsConfigAsPatch() && canUseDataDir();
    }

    private boolean canUseDataDir() {
        return !getDataDir().isEmpty() &&
               Stream.of(getDataDir().split(","))
                       .anyMatch(folder -> !folder.trim().isEmpty() && new File(folder).exists());
    }

    /**
     * Removes an installed plugin extension.
     */
    @Secured({"ROLE_ADMIN"})
    @RequestMapping(value = "/uninstallPlugin/{pluginName}", method = RequestMethod.DELETE)
    public @ResponseBody String uninstallPlugin(@PathVariable String pluginName) throws IOException {
        validatePluginName(pluginName);

        ObjectNode configObj = getExtensionConfig();
        if (configObj.has(pluginName)) {
            JsonNode pluginConfig = configObj.get(pluginName);
            String pluginBundle = pluginConfig.get("bundle").asText();
            String pluginFolder = pluginBundle.substring(0, pluginBundle.lastIndexOf("/"));

            // Compute the folder to remove relative to extensions root
            Path folderRel = Paths.get(pluginFolder).normalize();
            removeFolderSecurely(folderRel);

            // Update configurations after removing the folder
            configObj.remove(pluginName);
            storeJSONConfig(configObj, getExtensionsConfigPath());

            ObjectNode pluginsConfigObj = null;
            ArrayNode plugins;
            if (shouldStorePluginsConfigAsPatch()) {
                plugins = getPluginsConfigurationPatch();
            } else {
                pluginsConfigObj = getPluginsConfiguration();
                plugins = (ArrayNode) pluginsConfigObj.get("plugins");
            }

            int toRemove = -1;
            for (int i = 0; i < plugins.size(); i++) {
                JsonNode plugin = plugins.get(i);
                String name = plugin.has("name") ? plugin.get("name").asText()
                        : plugin.get("value").get("name").asText();
                if (name.contentEquals(pluginName)) {
                    toRemove = i;
                }
            }

            if (toRemove >= 0) {
                plugins.remove(toRemove);
            }

            if (shouldStorePluginsConfigAsPatch()) {
                storeJSONConfig(plugins, getPluginsConfigPatchFilePath());
            } else {
                storeJSONConfig(pluginsConfigObj, getPluginsConfig());
            }

            return pluginConfig.toString();
        } else {
            return "{}";
        }
    }

    /**
     * Remove a folder *under the extensions root* with containment checks.
     */
    private void removeFolderSecurely(Path folderRelativeToExtensions) throws IOException {
        if (folderRelativeToExtensions == null) {
            throw new IllegalArgumentException("Plugin folder path cannot be null.");
        }

        // POSIX join so mocked getRealPath(".../My") matches
        String relUnderExtensions = getExtensionsFolder().replace('\\', '/')
                                    + "/" + folderRelativeToExtensions.toString().replace('\\', '/');

        String resolvedPath = ResourceUtils.getResourcePath(getWriteStorage(), context, relUnderExtensions, true);
        if (resolvedPath == null) {
            throw new FileNotFoundException("The specified folder path could not be resolved: " + relUnderExtensions);
        }

        File folderPath = new File(resolvedPath).getCanonicalFile();

        // Optional extra containment when a dataDir is configured (baseFolder != "")
        String baseFolder = getWriteStorage();
        if (baseFolder != null && !baseFolder.isEmpty()) {
            File base = new File(baseFolder).getCanonicalFile();
            String basePath = base.getPath();
            String targetPath = folderPath.getPath();
            if (!targetPath.equals(basePath) && !targetPath.startsWith(basePath + File.separator)) {
                throw new IOException("Unauthorized path traversal attempt detected.");
            }
        }

        if (folderPath.exists()) {
            FileUtils.cleanDirectory(folderPath);
            if (!folderPath.delete()) {
                throw new IOException("The specified folder path could not be deleted: " + folderPath.getAbsolutePath());
            }
        } else {
            throw new FileNotFoundException("The specified folder path does not exist: " + folderPath.getAbsolutePath());
        }
    }

    private Optional<File> findResource(String resourceName) {
        return ResourceUtils.findResource(getDataDir(), context, resourceName);
    }

    /**
     * Move a temp file to a destination under the extensions root.
     *
     * @param relativeTarget path RELATIVE to the extensions root (POSIX, e.g., "<plugin>/assets/…")
     */
    private void moveAsset(File tempAsset, String relativeTarget) throws IOException {
        // POSIX form so ServletContext#getRealPath mocks (contains("custom/"), contains("My")) match
        String relUnderExtensions = getExtensionsFolder().replace('\\', '/')
                                    + "/" + relativeTarget.replace('\\', '/');

        // Resolve to absolute canonical path; ResourceUtils enforces containment
        String destPathStr = ResourceUtils.getResourcePath(getWriteStorage(), context, relUnderExtensions, true);
        if (destPathStr == null) {
            throw new IOException("Unable to resolve destination path for: " + relUnderExtensions);
        }

        File destFile = new File(destPathStr);
        File parent = destFile.getParentFile();
        if (parent != null && !parent.exists() && !parent.mkdirs()) {
            throw new IOException("Unable to create parent directories for: " + destFile.getAbsolutePath());
        }

        try (FileInputStream input = new FileInputStream(tempAsset);
             FileOutputStream output = new FileOutputStream(destFile)) {
            IOUtils.copy(input, output);
        }

        if (!tempAsset.delete()) {
            throw new IOException("Temporary file could not be deleted: " + tempAsset.getAbsolutePath());
        }
    }

    private String getWriteStorage() {
        return getDataDir().isEmpty() ? "" : Stream.of(getDataDir().split(",")).filter(folder -> !folder.trim().isEmpty()).findFirst().orElse("");
    }

    private void addPluginConfiguration(JsonNode json) throws IOException {
        ObjectNode config;
        Optional<File> pluginsConfigFile = findResource(getPluginsConfigPath());
        if (pluginsConfigFile.isPresent()) {
            try (FileInputStream input = new FileInputStream(pluginsConfigFile.get())) {
                config = (ObjectNode) readJSON(input);
            } catch (FileNotFoundException e) {
                config = jsonNodeFactory.objectNode();
                config.set("plugins", jsonNodeFactory.arrayNode());
            }
        } else {
            config = jsonNodeFactory.objectNode();
            config.set("plugins", jsonNodeFactory.arrayNode());
        }
        if (config != null) {
            ArrayNode plugins = (ArrayNode) config.get("plugins");
            int remove = -1;
            for (int count = 0; count < plugins.size(); count++) {
                JsonNode node = plugins.get(count);
                if (json.get("name").asText().equals(node.get("name").asText())) {
                    remove = count;
                }
            }
            if (remove >= 0) {
                plugins.remove(remove);
            }
            plugins.add(json);
            storeJSONConfig(config, getPluginsConfigPath());
        }
    }

    private void addPluginConfigurationAsPatch(JsonNode json) throws IOException {
        ArrayNode config;
        String configPath = getPluginsConfigPatchFilePath();
        Optional<File> pluginsConfigFile = findResource(configPath);

        if (pluginsConfigFile.isPresent()) {
            try (FileInputStream input = new FileInputStream(pluginsConfigFile.get())) {
                config = (ArrayNode) readJSON(input);
            } catch (FileNotFoundException e) {
                config = jsonNodeFactory.arrayNode();
            }
        } else {
            config = jsonNodeFactory.arrayNode();
        }
        if (config != null) {
            int remove = -1;
            for (int count = 0; count < config.size(); count++) {
                JsonNode node = config.get(count);
                if (json.get("name").asText().equals(node.get("value").get("name").asText())) {
                    remove = count;
                }
            }
            if (remove >= 0) {
                config.remove(remove);
            }

            ObjectNode plugin = new ObjectNode(jsonNodeFactory);
            plugin.put("op", "add");
            plugin.put("path", "/plugins/-");
            plugin.set("value", json);
            config.add(plugin);
            storeJSONConfig(config, configPath);
        }
    }

    private ObjectNode getPluginsConfiguration() throws IOException {
        Optional<File> pluginsConfigFile = findResource(getPluginsConfigPath());
        if (pluginsConfigFile.isPresent()) {
            try (FileInputStream input = new FileInputStream(pluginsConfigFile.get())) {
                return (ObjectNode) readJSON(input);
            }
        } else {
            throw new FileNotFoundException(getPluginsConfigPath());
        }
    }

    private ArrayNode getPluginsConfigurationPatch() throws IOException {
        Optional<File> pluginsConfigFile = findResource(getPluginsConfigPatchFilePath());
        if (pluginsConfigFile.isPresent()) {
            try (FileInputStream input = new FileInputStream(pluginsConfigFile.get())) {
                return (ArrayNode) readJSON(input);
            }
        } else {
            throw new FileNotFoundException(getPluginsConfigPatchFilePath());
        }
    }

    private void storeJSONConfig(Object config, String configName) throws IOException {
        ResourceUtils.storeJSONConfig(getWriteStorage(), context, config, configName);
    }

    private void addExtension(String pluginName, String pluginBundleRelative, String translationsRelative)
            throws IOException {
        ObjectNode config;
        Optional<File> extensionsConfigFile = findResource(getExtensionsConfigPath());
        if (extensionsConfigFile.isPresent()) {
            try (FileInputStream input = new FileInputStream(extensionsConfigFile.get())) {
                config = (ObjectNode) readJSON(input);
            } catch (FileNotFoundException e) {
                config = jsonNodeFactory.objectNode();
            }
        } else {
            config = jsonNodeFactory.objectNode();
        }
        if (config != null) {
            ObjectNode extension = jsonNodeFactory.objectNode();
            extension.put("bundle", pluginBundleRelative); // POSIX in JSON
            if (translationsRelative != null) {
                extension.put("translations", translationsRelative); // POSIX in JSON
            }
            if (config.has(pluginName)) {
                config.replace(pluginName, extension);
            } else {
                config.set(pluginName, extension);
            }
            storeJSONConfig(config, getExtensionsConfigPath());
        }
    }

    private ObjectNode getExtensionConfig() throws IOException {
        Optional<File> extensionsConfigFile = findResource(getExtensionsConfigPath());
        if (extensionsConfigFile.isPresent()) {
            try (FileInputStream input = new FileInputStream(extensionsConfigFile.get())) {
                return (ObjectNode) readJSON(input);
            }
        } else {
            throw new FileNotFoundException();
        }
    }

    private JsonNode readJSON(InputStream input) throws IOException {
        byte[] buffer = new byte[4096];
        int read;
        StringBuilder json = new StringBuilder();
        while ((read = input.read(buffer)) >= 0) {
            json.append(new String(buffer, 0, read, StandardCharsets.UTF_8));
        }
        return jsonMapper.readTree(json.toString());
    }

    private void storeAsset(ZipInputStream zip, File file) throws IOException {
        try (FileOutputStream outFile = new FileOutputStream(file)) {
            byte[] buffer = new byte[8192];
            int read;
            while ((read = zip.read(buffer)) >= 0) {
                outFile.write(buffer, 0, read);
            }
        }
    }

    public void setContext(ServletContext context) {
        this.context = context;
    }

    private String getExtensionsConfigPath() {
        return Paths.get(getExtensionsFolder(), getExtensionsConfig()).toString();
    }

    private String getPluginsConfigPath() {
        return Paths.get(getConfigsFolder(), getPluginsConfig()).toString();
    }

    private String getPluginsConfigPatchFilePath() {
        return getPluginsConfigPath() + ".patch";
    }
}
