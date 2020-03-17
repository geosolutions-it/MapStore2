/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
package it.geosolutions.mapstore;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import javax.servlet.ServletContext;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import it.geosolutions.mapstore.utils.ResourceUtils;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/**
 * REST service used to upload an extension.
 * Can be configured using the following properties:
 *  - datadir.location: base folder where the configuration files will be stored (default: empty, stores in application root)
 *  - extensions.folder: base folder where the extension will be stored (default: dist/extensions)
 *  - extensions.registry: json file where uploaded extensions are registered (default: extensions.json)
 *  - context.plugins.config: json file where context creator plugins are configured (default: pluginsConfig.json)
 */
@Controller
public class UploadPluginController {
	@Value("${datadir.location:}") private String dataDir = "";
    @Value("${extensions.folder:dist/extensions}") private String bundlesPath = "dist/extensions";
    @Value("${extensions.registry:extensions.json}") private String extensionsConfig = "extensions.json";
    @Value("${context.plugins.config:pluginsConfig.json}") private String pluginsConfig = "pluginsConfig.json";
    
    @Autowired
    ServletContext context;
    
    /**
     * Stores and uploaded plugin zip bundle.
     * The zip bundle must be POSTed as the body of the request.
     * The content of the bundle will be handled as follows:
     *  - javascript files (compiled bundles) will be stored in extensions.folder (in a subfolder with the extension name)
     *  - assets files (translations) will be stored in extensions.folder (in the translations folder of a subfolder with the extension name)
     *  - the extensions registry file will be updated with data read from the zip index.json file
     *  - the context creator plugins file will be updated with data read from the zip index.json file
     */
    @Secured({ "ROLE_ADMIN" })
    @RequestMapping(value="/uploadPlugin", method = RequestMethod.POST, headers = "Accept=application/json")
    public @ResponseBody String uploadPlugin(InputStream dataStream) throws IOException {
        ZipInputStream zip = new ZipInputStream(dataStream);
        ZipEntry entry = zip.getNextEntry();
        String pluginName = null;;
        String bundleName = null;
        Map<File, String> tempFiles = new HashMap<File, String>();
        JSONObject plugin = null;
        boolean addTranslations = false;
        while(entry != null) {
            if (!entry.isDirectory()) {
                if (entry.getName().toLowerCase().endsWith(".js")) {
                    bundleName = entry.getName();
                    File tempBundle = File.createTempFile("mapstore-bundle", ".js");
                    storeAsset(zip, tempBundle);
                    tempFiles.put(tempBundle, "js");
                }
                if ("index.json".equals(entry.getName().toLowerCase())) {
                    JSONObject json = readJSON(zip);
                    JSONArray plugins = json.getJSONArray("plugins");
                    // TODO: add support for many plugins in one single extension
                    plugin = plugins.getJSONObject(0);
                    plugin.accumulate("extension", true);
                    pluginName = plugin.getString("name");
                    addPluginConfiguration(plugin);
                }
                if(entry.getName().toLowerCase().startsWith("translations/")) {
                    File tempAsset = File.createTempFile("mapstore-asset-translations", ".json");
                    storeAsset(zip, tempAsset);
                    tempFiles.put(tempAsset, "asset/" + entry.getName());
                    addTranslations = true;
                }
            }
            entry = zip.getNextEntry();
        }
        String pluginBundle = bundlesPath + "/" + pluginName + "/" + bundleName;
        String translations = addTranslations ? bundlesPath + "/" + pluginName + "/translations" : null;
        addExtension(pluginName + "Plugin", pluginBundle, translations);
        for(File tempFile : tempFiles.keySet()) {
            String type = tempFiles.get(tempFile);
            if ("js".equals(type)) {
                moveAsset(tempFile, pluginBundle);
            }
            if(type.indexOf("asset/") == 0) {
                String assetPath = bundlesPath + "/" + pluginName + "/" + type.substring(type.indexOf("/") + 1);
                moveAsset(tempFile, assetPath);
            }
        }
       
        zip.close();
        if (plugin == null) {
            throw new IOException("Invalid bundle: index.json missing");
        }
        return plugin.toString();
    }
    
    /**
     * Removes an installed plugin extension.
     * @param pluginName name of the extension to be removed
     */
    @Secured({ "ROLE_ADMIN" })
    @RequestMapping(value="/uninstallPlugin/{pluginName}", method = RequestMethod.DELETE)
    public @ResponseBody String uninstallPlugin(@PathVariable String pluginName) throws IOException {
    	JSONObject configObj = getExtensionConfig();
    	JSONObject pluginsConfigObj = getPluginsConfiguration();
    	String key = pluginName + "Plugin";
		if (configObj.containsKey(key)) {
    		JSONObject pluginConfig = configObj.getJSONObject(key);
    		String pluginBundle = pluginConfig.getString("bundle");
    		String pluginFolder = pluginBundle.substring(0, pluginBundle.lastIndexOf("/"));
    		removeFolder(pluginFolder);
    		
    		JSONArray plugins = pluginsConfigObj.getJSONArray("plugins");
    		JSONObject toRemove = null;
    		for(int i = 0; i < plugins.size(); i++) {
    			JSONObject plugin = plugins.getJSONObject(i);
    			String name = plugin.getString("name");
    			if (name.contentEquals(pluginName)) {
    				toRemove = plugin;
    			}
    		}
    		if (toRemove != null) {
    			plugins.remove(toRemove);
    		}
    		
    		
    		configObj.remove(key);
    		storeJSONConfig(configObj, extensionsConfig);
    		storeJSONConfig(pluginsConfigObj, pluginsConfig);
    		return pluginConfig.toString();
    	} else {
    		return new JSONObject().toString();
    	}
    }

    private void removeFolder(String pluginFolder) throws IOException {
    	File folderPath = new File(ResourceUtils.getResourcePath(dataDir, context, pluginFolder));
    	if (folderPath.exists()) {
			FileUtils.cleanDirectory(folderPath);
			folderPath.delete();
    	}
	}

	public void setBundlesPath(String bundlesPath) {
        this.bundlesPath = bundlesPath;
    }

    public void setExtensionsConfig(String extensionsConfig) {
        this.extensionsConfig = extensionsConfig;
    }

    public void setPluginsConfig(String pluginsConfig) {
        this.pluginsConfig = pluginsConfig;
    }

    private Optional<File> findResource(String resourceName) {
    	return ResourceUtils.findResource(dataDir, context, resourceName);
    }

    private void moveAsset(File tempAsset, String finalAsset) throws FileNotFoundException, IOException {
    	String assetPath = ResourceUtils.getResourcePath(dataDir, context, finalAsset);
        new File(assetPath).getParentFile().mkdirs();
        try (FileInputStream input = new FileInputStream(tempAsset); FileOutputStream output = new FileOutputStream(assetPath)) {
            IOUtils.copy(input, output);
        }
        tempAsset.delete();
    }

    private void addPluginConfiguration(JSONObject json) throws IOException {
        JSONObject config = null;
        Optional<File> pluginsConfigFile = findResource(pluginsConfig);
        if (pluginsConfigFile.isPresent()) {
        	try (FileInputStream input = new FileInputStream(pluginsConfigFile.get())) {
                config = readJSON(input);
            } catch (FileNotFoundException e) {
                config = new JSONObject();
                config.accumulate("plugins", new JSONArray());
            }
        } else {
        	config = new JSONObject();
            config.accumulate("plugins", new JSONArray());
        }
        if (config != null) {
            JSONArray plugins = config.getJSONArray("plugins");
            plugins.removeIf(new Predicate<JSONObject>() {
                @Override
                public boolean test(JSONObject plugin) {
                    return plugin.getString("name").equals(json.getString("name"));
                }
                
            });
            plugins.add(json);
            storeJSONConfig(config, pluginsConfig);
        }
    }
    
    private JSONObject getPluginsConfiguration() throws IOException {
        Optional<File> pluginsConfigFile = findResource(pluginsConfig);
        if (pluginsConfigFile.isPresent()) {
        	try (FileInputStream input = new FileInputStream(pluginsConfigFile.get())) {
                return readJSON(input);
            }
        } else {
        	throw new FileNotFoundException(pluginsConfig);
        }
    }

    private void storeJSONConfig(JSONObject config, String configName) throws FileNotFoundException, IOException {
    	ResourceUtils.storeJSONConfig(dataDir, context, config, configName);
    }
    
    private void addExtension(String pluginName, String pluginBundle, String translations) throws FileNotFoundException, IOException {
        JSONObject config = null;
        Optional<File> extensionsConfigFile = findResource(extensionsConfig);
        if (extensionsConfigFile.isPresent()) {
	        try (FileInputStream input = new FileInputStream(extensionsConfigFile.get())) {
	            config = readJSON(input);
	        } catch (FileNotFoundException e) {
	            config = new JSONObject();
	        }
        } else {
        	config = new JSONObject();
        }
        if (config != null) {
            JSONObject extension = new JSONObject();
            extension.accumulate("bundle", pluginBundle);
            if (translations != null) {
            	extension.accumulate("translations", translations);
            }
            if (config.containsKey(pluginName)) {
                config.replace(pluginName,extension);
            } else {
                config.accumulate(pluginName,extension);
            }
            storeJSONConfig(config, extensionsConfig);
        }
    }
    
    private JSONObject getExtensionConfig() throws IOException {
        Optional<File> extensionsConfigFile = findResource(extensionsConfig);
        if (extensionsConfigFile.isPresent()) {
	        try (FileInputStream input = new FileInputStream(extensionsConfigFile.get())) {
	            return readJSON(input);
	        }
        } else {
        	throw new FileNotFoundException(extensionsConfig);
        }
    }

    private JSONObject readJSON(InputStream input) throws IOException {
        byte[] buffer = new byte[1024];
        int read = 0;
        StringBuilder json = new StringBuilder();
        while ((read = input.read(buffer, 0, 1024)) >= 0) {
            json.append(new String(buffer, 0, read));
        }
        return JSONObject.fromObject(json.toString());
    }

    private void storeAsset(ZipInputStream zip, File file) throws FileNotFoundException, IOException {
        try(FileOutputStream outFile = new FileOutputStream(file)) {
            byte[] buffer = new byte[1024];
            int read = 0;
            while ((read = zip.read(buffer, 0, 1024)) >= 0) {
                outFile.write(buffer, 0, read);
           }
        }
    }

    public void setDataDir(String dataDir) {
        this.dataDir = dataDir;
    }
    
    public void setContext(ServletContext context) {
        this.context = context;
    }
    
    
}
