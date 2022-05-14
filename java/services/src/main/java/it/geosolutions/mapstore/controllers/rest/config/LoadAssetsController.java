/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
package it.geosolutions.mapstore.controllers.rest.config;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.function.Predicate;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.HandlerMapping;

import it.geosolutions.mapstore.controllers.BaseConfigController;

/**
 * REST service for configuration files usage.
 * Allows loading configuration files from an external source (a folder outside of the webserver).
 * Can be configured using the following properties:
 *  - allowed.resources comma delimited list of configuration files that can be loaded using this service (whitelist), *
 * The overrides technique allows to take some values to insert in the config json from a simple Java properties file.
 * @deprecated in favor of configs and extensions controllers
 *
 */
@Controller
public class LoadAssetsController extends BaseConfigController {
	@Value("${allowed.resources:localConfig,pluginsConfig,extensions,config,new}") protected String allowedResources = "localConfig,pluginsConfig,extensions,config,new";
    /**
     * Loads the resource, from the configured location (datadir or web root).
     * Both locations are tested and the resource is returned from the first location found.
     * The resource name should be in the allowed.resources list.
     *
     * It is also possible to store in datadir files in the json-patch format (with a .json.patch extension)
     * so that the final resource is built merging a static configuration with a patch.
     *
     * @deprecated Use ConfigsController entry-point instead
     * @param {String} resourceName name of the resource to load (e.g. localConfig)
     * @param {boolean} overrides apply overrides from the configured properties file (if any)
     */
    @RequestMapping(value="/load/{resource}", method = RequestMethod.GET)
    public @ResponseBody byte[] loadResource(@PathVariable("resource") String resourceName, @RequestParam(value="overrides", defaultValue="true") boolean applyOverrides) throws IOException {
    	resourceName = normalizeResource(resourceName, "json");
        if (isAllowed(resourceName)) {
            return toBytes(readResource(resourceName + ".json", applyOverrides, resourceName + ".json.patch"));
        }
        throw new ResourceNotAllowedException("Resource is not allowed");
    }

    private String normalizeResource(String name, String extension) {
    	if(name.toLowerCase().endsWith("." + extension.toLowerCase())) {
    		return name.substring(0, name.length() - 1 - extension.length());
    	}
    	return name;
	}

	/**
     * Loads an asset from the datadir, if defined, from the webapp root folder otherwise.
     * Allows loading externalized assets (javascript bundles, translation files, and so on).
     * The rest of the URL from /loadasset/ is intended to be the path to resource.
     */
    @RequestMapping(value="/loadasset/**", method = RequestMethod.GET)
    public void loadAsset(HttpServletRequest request, HttpServletResponse response) throws IOException {
    	String resourcePath = ((String) request.getAttribute(
    	        HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE)).split("/loadasset/")[0];
    	if (Paths.get(resourcePath).isAbsolute()) {
    		throw new IOException("Absolute paths are not allowed!");
    	}
        Resource resource = readResource(resourcePath, false, "");
        response.setContentType(resource.type);
        IOUtils.copy(toStream(resource), response.getOutputStream());
    }
    protected boolean isAllowed(String resourceName) {
        return Stream.of(allowedResources.split(",")).anyMatch(new Predicate<String>() {
            @Override
            public boolean test(String p) {
                return p.equals(resourceName);
            }

        });
    }


}
