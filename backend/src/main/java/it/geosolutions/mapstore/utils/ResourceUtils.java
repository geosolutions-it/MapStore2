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
import java.util.function.Function;
import java.util.function.IntFunction;
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
	
	/**
	 * Finds a resource, recursively looking at a list of folders, and at last at
	 * the web application context path.
	 * 
	 * @param baseFolders  comma delimited list of folders, in order of search
	 * @param context      web application context (last resource)
	 * @param resourceName name of the resource to be found
	 * @return
	 */
	public static Optional<File> findResource(String baseFolders, ServletContext context, String resourceName) {
		String[] candidates = Stream.concat(Stream.of(baseFolders.split(",")).map(new Function<String, String>() {

			@Override
			public String apply(String f) {
				return f + "/" + resourceName;
			}

		}), Stream.of(new String[] { context.getRealPath(resourceName) })).toArray(new IntFunction<String[]>() {
			@Override
			public String[] apply(int size) {
				return new String[size];
			}
		});
		Optional<String> resourcePath = findExisting(candidates);
		if (resourcePath.isPresent()) {
			return Optional.of(new File(resourcePath.get()));
		}
		return Optional.empty();
	}
	
	public static String getResourcePath(String baseFolder, ServletContext context, String path) {
        return getResourcePath(baseFolder, context, path, false);
    }
	
	public static String getResourcePath(String baseFolder, ServletContext context, String path, boolean write) {
		return baseFolder.isEmpty() ? getContextPath(context, path, write) : baseFolder + "/" + path;
	}
	
	private static String getContextPath(ServletContext context, String path, boolean write) {
	    String candidate = context.getRealPath(path);
	    if (candidate == null && write) {
	        candidate = context.getRealPath("") + "/" + path;
	    }
        return candidate;
    }

    public static void storeJSONConfig(String baseFolder, ServletContext context, Object config, String configName) throws FileNotFoundException, IOException {
		String outputFile = getResourcePath(baseFolder, context, configName, true);
        try (FileOutputStream output = new FileOutputStream(outputFile)) {
            output.write(config.toString().getBytes());
        }
    }
}
