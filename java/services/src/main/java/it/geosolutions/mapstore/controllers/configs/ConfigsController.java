/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
package it.geosolutions.mapstore.controllers.configs;

import java.io.IOException;
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
     * Both locations are tested and the resource is returned from the first location found.
     * The resource name should be in the allowed.resources list.
     *
     * It is also possible to store in datadir files in the json-patch format (with a .json.patch extension)
     * so that the final resource is built merging a static configuration with a patch.
     *
     * @param {String} resourceName name of the resource to load (e.g. localConfig)
     * @param {boolean} overrides apply overrides from the configured properties file (if any)
     */
    @RequestMapping(value="/{resource}", method = RequestMethod.GET) // TODO: search in configs directory base
    public @ResponseBody byte[] loadResource(@PathVariable("resource") String resourceName, @RequestParam(value="overrides", defaultValue="true") boolean applyOverrides) throws IOException {
        return toBytes(readResource( Paths.get(getConfigsFolder(),  normalizeExtension(resourceName, "json")).toString(), applyOverrides, Paths.get(getConfigsFolder(),  normalizePatchExtension(resourceName, "json", "patch")).toString()));
    }

    private String normalizeExtension(String name, String extension) {
        if (name.toLowerCase().endsWith("." + extension.toLowerCase()))
            return name;
        return name + "." + extension;
    }
    private String normalizePatchExtension(String name, String extension, String patchExtension) {
        if (name.toLowerCase().endsWith("." + extension.toLowerCase()))
            return name + "." + patchExtension; // config.json --> config.json+.patch
        return name + "." + extension + "." + patchExtension; // config --> config+.json.patch
    }
}
