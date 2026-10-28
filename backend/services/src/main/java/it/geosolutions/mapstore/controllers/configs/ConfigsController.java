/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
package it.geosolutions.mapstore.controllers.configs;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import it.geosolutions.mapstore.controllers.BaseConfigController;

/**
 * Service for configuration files usage.
 * Allows to mask the path /configs/ to provide the JSON files
 * - from data-dir, if present, or from configs directory of the webapp
 * - Applying patch files, where present
 * - Applying overrides, when present
 *
 */
@Controller
public class ConfigsController extends BaseConfigController {

    /**
     * Loads the resource, from the configured location (datadir or web root).
     * Both locations are tested, and the resource is returned from the first location found.
     * The resource name should be in the allowed. Resources list.
     * <p>
     * It is also possible to store in datadir files in the json-patch format (with a .json.patch extension)
     * so that the final resource is built merging a static configuration with a patch.
     *
     * @param resourceName Name of the resource to load (e.g., localConfig).
     * @param applyOverrides Apply overrides from the configured properties file (if any).
     * @return The configuration file as a byte array.
     * @throws IOException If an error occurs while reading the resource.
     */
    @RequestMapping(value = "/{resource}", method = RequestMethod.GET)
    public @ResponseBody byte[] loadResource(@PathVariable("resource") String resourceName,
                                             @RequestParam(value = "overrides", defaultValue = "true") boolean applyOverrides) throws IOException {

        // Validate the resource name to prevent path traversal
        String sanitizedResourceName = sanitizeResourceName(resourceName);

        // Construct paths for the primary configuration and patch files
        Path configPath = Paths.get(getConfigsFolder(), normalizedFilePath(sanitizedResourceName, "json"));
        Path patchPath = Paths.get(getConfigsFolder(), normalizePatchExtension(sanitizedResourceName, "json", "patch"));

        // Ensure that both paths stay within the base configurations directory
        validatePathWithinConfigDirectory(configPath);
        validatePathWithinConfigDirectory(patchPath);

        // Load the primary configuration and apply the patch if it exists
        return toBytes(readResource(configPath.toString(), applyOverrides, patchPath.toString()));
    }

    /**
     * Sanitizes the resource name to prevent directory traversal attacks.
     *
     * @param resourceName The original resource name from the request.
     * @return A sanitized resource name with only valid file name characters.
     * @throws IOException If the resource name is invalid.
     */
    private String sanitizeResourceName(String resourceName) throws IOException {
        if (resourceName.contains("..") || resourceName.contains(File.separator)) {
            throw new IOException("Invalid resource name: Directory traversal attempt detected.");
        }
        return resourceName;
    }

    /**
     * Normalize the file path by adding an extension if it's missing.
     *
     * @param name The file name or resource name.
     * @param extension The extension to ensure on the file name.
     * @return The normalized file path with the correct extension.
     */
    private String normalizedFilePath(String name, String extension) {
        if (!name.toLowerCase().endsWith("." + extension)) {
            return name + "." + extension;
        }
        return name;
    }

    private String normalizePatchExtension(String name, String extension, String patchExtension) {
        if (name.toLowerCase().endsWith("." + extension.toLowerCase()))
            return name + "." + patchExtension; // config.json --> config.json+.patch
        return name + "." + extension + "." + patchExtension; // config --> config+.json.patch
    }

    /**
     * Validates that a path is within the base configurations' directory.
     *
     * @param path The path to validate.
     * @throws IOException If the path is outside the base directory.
     */
    private void validatePathWithinConfigDirectory(Path path) throws IOException {
        Path baseDir = Paths.get(getConfigsFolder()).toAbsolutePath().normalize();
        if (!path.toAbsolutePath().normalize().startsWith(baseDir)) {
            throw new IOException("Access to the specified resource is denied.");
        }
    }
}
