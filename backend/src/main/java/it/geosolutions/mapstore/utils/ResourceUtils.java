/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
package it.geosolutions.mapstore.utils;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Stream;

import javax.servlet.ServletContext;

import net.sf.json.JSONObject;

public class ResourceUtils {
	public static Optional<String> findExisting(String[] candidates) {
        return Stream.of(candidates)
        .filter(new Predicate<String>() {
            @Override
            public boolean test(String path) {
                return path != null && new File(path).exists();
            }
            
        })
        .findFirst();
    }
	
	public static Optional<File> findResource(String baseFolder, ServletContext context, String resourceName) {
    	Optional<String> resourcePath = findExisting(new String[] {baseFolder + "/" + resourceName, context.getRealPath(resourceName)});
    	if (resourcePath.isPresent()) {
    		return Optional.of(new File(resourcePath.get()));
        }
    	return Optional.empty();
	}
	
	public static String getResourcePath(String baseFolder, ServletContext context, String path) {
		return baseFolder.isEmpty() ? context.getRealPath(path) : baseFolder + "/" + path;
	}
	
	public static void storeJSONConfig(String baseFolder, ServletContext context, JSONObject config, String configName) throws FileNotFoundException, IOException {
		String outputFile = getResourcePath(baseFolder, context, configName);
        try (FileOutputStream output = new FileOutputStream(outputFile)) {
            output.write(config.toString().getBytes());
        }
    }
}
