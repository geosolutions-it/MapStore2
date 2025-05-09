/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
package it.geosolutions.mapstore.controllers;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.Properties;
import java.util.function.Consumer;
import java.util.stream.Stream;

import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;

import eu.medsea.mimeutil.MimeType;
import eu.medsea.mimeutil.MimeUtil;
import it.geosolutions.mapstore.utils.ResourceUtils;

/**
 * Base classes for configuration services.
 * Allows loading configuration files from an external source (a folder outside of the webserver).
 * Can be configured using the following properties:
 *  - datadir.location absolute path of a folder where configuration files are fetched from (default: empty)
 *  - overrides.config: optional properties file path where overrides for the base config file are stored (default: empty)
 *  - overrides.mappings: optional list of mappings from the override configuration files, to the configuration files properties (default: empty)
 *    format: <json_path>=<propertyName>,...,<json_path>=<propertyName>
 *    example: header.height=headerHeight,header.url=headerUrl
 *
 * The overrides technique allows to take some values to insert in the config json from a simple Java properties file.
 * TODO: make this a configuration bean that can be shared across controllers.
 *
 */
@Controller
public abstract class BaseConfigController extends BaseMapStoreController {
    public class Resource {
        public String data;
        public String type;
        public File file;
    }

    static {
    	MimeUtil.registerMimeDetector("eu.medsea.mimeutil.detector.ExtensionMimeDetector");
    }

    protected ObjectMapper jsonMapper = new ObjectMapper();

    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    public class ResourceNotFoundException extends RuntimeException {

		private static final long serialVersionUID = 1L;

		public ResourceNotFoundException(String message) {
            super(message);
        }
    }

    @ResponseStatus(value = HttpStatus.FORBIDDEN)
    public class ResourceNotAllowedException extends RuntimeException {

		private static final long serialVersionUID = 1L;

		public ResourceNotAllowedException(String message) {
            super(message);
        }
    }

    /**
    * Loads an asset from the datadir, if defined, from the webapp root folder otherwise.
    * Allows loading externalized assets (javascript bundles, translation files, and so on.
    * @param resourcePath path of the asset to load
    */
   public byte[] loadAsset(String resourcePath) throws IOException {
		return toBytes(readResource(resourcePath, false, ""));
   }



    protected InputStream toStream(Resource resource) throws IOException {
    	 // data has been processed (read in UTF-8, must be converted again)
        if(resource.data != null) {
        	// check mime type
        	byte[] bytes = toBytes(resource);
        	InputStream in = new ByteArrayInputStream(bytes);
            return in;
        } else if(resource.file != null) {
        	return new FileInputStream(resource.file);
        }
        return null;

    }
    protected byte[] toBytes(Resource resource) throws UnsupportedEncodingException {
    	return resource.data.getBytes("UTF-8");
    }
    protected Resource readResource(String resourceName, boolean applyOverrides, String patchName) throws IOException {
    	Optional<File> resource = ResourceUtils.findResource(getDataDir(), getContext(), resourceName);
    	Optional<File> resourcePatch = patchName.isEmpty() ? Optional.empty() : ResourceUtils.findResource(getDataDir(), getContext(), patchName);
        if (!resource.isPresent()) {
            throw new ResourceNotFoundException(resourceName);
        }
        return readResourceFromFile(resource.get(), applyOverrides, resourcePatch);
    }

    protected Resource readResourceFromFile(File file, boolean applyOverrides, Optional<File> patch) throws IOException {
    	Resource resource = new Resource();
        resource.file = file;

        MimeType type = MimeUtil.getMostSpecificMimeType(MimeUtil.getMimeTypes(file));
        resource.type = type != null ? type.toString() : null;
        try (Stream<String> stream =
                Files.lines( Paths.get(file.getAbsolutePath()), StandardCharsets.UTF_8); ) {
            Properties props = readOverrides();
            if (applyOverrides && (!"".equals(getMappings()) && props != null || patch.isPresent())) {
            	resource.data = resourceWithPatch(stream, props, patch);
                return resource;
            }


            try {
            	StringBuilder contentBuilder = new StringBuilder();
                stream.forEach(new Consumer<String>() {
                    @Override
                    public void accept(String s) {
                        contentBuilder.append(s).append("\n"); // note: this adds a new line at the end of js files too.
                    }
                });
                resource.data = contentBuilder.toString();
            } catch (Exception e) {
            	// if can not read the file line by line(e.g. images) pass the file.
            	resource.file = file;
            }
            return resource;
        }

    }

    protected String resourceWithPatch(Stream<String> stream, Properties props, Optional<File> patch) throws IOException {
        JsonNode jsonObject = readJsonConfig(stream);
        if (patch.isPresent()) {
            jsonObject = mergeJSON(jsonObject, jsonMapper.readValue(patch.get(), JsonPatch.class));
        }
        if (!"".equals(getMappings()) && props != null) {

            for(String mapping : getMappings().split(",")) {
                jsonObject = fillMapping(mapping, props, jsonObject);
            }
        }
        return jsonObject.toString();
    }

    /**
     * Applies the given patch to a JSON tree (orig)
     *
     * @param orig
     * @param patch
     * @return
     * @throws IOException
     */
    protected JsonNode mergeJSON(JsonNode orig, JsonPatch patch) throws IOException {
        try {
            return patch.apply(orig);
        } catch (JsonPatchException e) {
            throw new IOException("Error applying patch", e);
        }
    }

    protected Properties readOverrides() throws FileNotFoundException, IOException {
        if (!"".equals(getOverrides())) {
        	Optional<File> resource = ResourceUtils.findResource(getDataDir(), getContext(), getOverrides());
            if (resource.isPresent()) {
                try (FileReader reader = new FileReader(resource.get())) {
                    Properties props = new Properties();
                    props.load(reader);
                    return props;
                }
            }
        }
        return null;
    }

    protected JsonNode readJsonConfig(Stream<String> stream) throws IOException {
        StringBuilder contentBuilder = new StringBuilder();
        stream.forEach(new Consumer<String>() {
            @Override
            public void accept(String s) {
                contentBuilder.append(s).append("\n");
            }
        });
        String json = contentBuilder.toString();
        JsonNode jsonObject = jsonMapper.readTree(json);
        return jsonObject;
    }

    protected JsonNode fillMapping(String mapping, Properties props, JsonNode jsonObject) throws IOException {
        String[] parts = mapping.split("=");
        if (parts.length != 2 || parts[0].trim().isEmpty() || parts[1].trim().isEmpty()) {
            return jsonObject;
        } else {
            String path = parts[0];
            String propName = parts[1];
            String value = props.getProperty(propName, "");
            return setJsonProperty(jsonObject, path.split("\\."), value);
        }
    }

    protected JsonNode setJsonProperty(JsonNode jsonObject, String[] path, String value) throws IOException {
        String propertyPath = "/" + StringUtils.join(path, "/");
        JsonPatch patch = jsonMapper.readValue("[{\"op\":\"replace\",\"path\":\""+propertyPath+"\",\"value\":\""+value+"\"}]", JsonPatch.class);
        try {
            return mergeJSON(jsonObject, patch);
        } catch(IOException e) {
            // if the property cannot be set, we ignore it
            return jsonObject;
        }
    }


}
