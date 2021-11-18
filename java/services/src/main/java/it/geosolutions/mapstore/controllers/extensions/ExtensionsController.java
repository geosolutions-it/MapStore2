/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
package it.geosolutions.mapstore.controllers.extensions;

import java.io.IOException;
import java.nio.file.Paths;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.HandlerMapping;

import it.geosolutions.mapstore.controllers.BaseConfigController;


/**
 * REST service for Extensions.
 * Provides extensions resources from the extensions directory from webapp or data-dir.
 */
@Controller
public class ExtensionsController extends BaseConfigController {

    /**
     * Loads an asset from the datadir, if defined, from the webapp root folder otherwise.
     * Allows loading externalized assets (javascript bundles, translation files, and so on).
     */
    @RequestMapping(value="**", method = RequestMethod.GET)
    public void loadAsset(HttpServletRequest request, HttpServletResponse response) throws IOException {
    	// sometimes it returns "/extensions.json", sometimes  "/extensions/extensions.json" (TODO: verify the cause to see if we can clean up code)
    	String resourcePath = ((String) request.getAttribute(
    	        HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE));
    	if(resourcePath.contains("/extensions/")) {
    		resourcePath = resourcePath.split("/extensions/")[0];
		
    	} else if(resourcePath.startsWith("/")) { 
    		resourcePath = resourcePath.substring(1);
    	}
    	if (Paths.get(resourcePath).isAbsolute()) {
    		throw new IOException("Absolute paths are not allowed!");
    	}
    	if(resourcePath.contains("..")) {
    		throw new IOException("Directory traversal detected!");
    	}
        Resource resource = readResource(Paths.get(getExtensionsFolder(), resourcePath).toString() , false, "");
        response.setContentType(resource.type);
        IOUtils.copy(toStream(resource), response.getOutputStream());
    }
}
