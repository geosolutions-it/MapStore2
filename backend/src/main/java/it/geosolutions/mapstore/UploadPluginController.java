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
import java.util.function.Predicate;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import javax.servlet.ServletContext;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

@Controller
public class UploadPluginController {
    @Value("${extensions.folder:dist/extensions}") private String bundlesPath;
    @Value("${extensions.registry:extensions.json}") private String extensionsConfig;
    @Value("${context.plugins.config:pluginsConfig.json}") private String pluginsConfig;
    
    @Autowired
    ServletContext context;
    
    @Secured({ "ROLE_ADMIN" })
    @RequestMapping(value="/uploadPlugin", method = RequestMethod.POST, headers = "Accept=application/json")
    public @ResponseBody String uploadPlugin(InputStream dataStream) throws IOException {
        ZipInputStream zip = new ZipInputStream(dataStream);
        ZipEntry entry = zip.getNextEntry();
        String pluginName = null;;
        String bundleName = null;
        File tempBundle = null;
        JSONObject plugin = null;
        while(entry != null) {
            if (entry.getName().toLowerCase().endsWith(".js")) {
                bundleName = entry.getName();
                tempBundle = File.createTempFile("mapstore-bundle", ".js");
                storeJsBundle(zip, tempBundle);
            }
            if (entry.getName().toLowerCase().endsWith(".json")) {
                JSONObject json = readJSON(zip);
                JSONArray plugins = json.getJSONArray("plugins");
                // TODO: add support for many plugins in one single extension
                plugin = plugins.getJSONObject(0);
                plugin.accumulate("extension", true);
                pluginName = plugin.getString("name");
                addPluginConfiguration(plugin);
            }
            entry = zip.getNextEntry();
        }
        String pluginBundle = bundlesPath + "/" + pluginName + "/" + bundleName;
        addExtension(pluginName + "Plugin", pluginBundle);
        moveJsBundle(tempBundle, pluginBundle);
        
        zip.close();
        return plugin.toString();
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



    private void moveJsBundle(File tempBundle, String pluginBundle) throws FileNotFoundException, IOException {
        new File(pluginBundle).getParentFile().mkdirs();
        try (FileInputStream input = new FileInputStream(tempBundle); FileOutputStream output = new FileOutputStream(pluginBundle)) {
            IOUtils.copy(input, output);
        }
        tempBundle.delete();
    }

    private void addPluginConfiguration(JSONObject json) throws IOException {
        JSONObject config = null;
        try (FileInputStream input = new FileInputStream(context.getRealPath(pluginsConfig))) {
            config = readJSON(input);
        } catch (FileNotFoundException e) {
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
            storePluginsConfig(config);
        }
    }

    private void storePluginsConfig(JSONObject config) throws FileNotFoundException, IOException {
        try (FileOutputStream output = new FileOutputStream(context.getRealPath(pluginsConfig))) {
            output.write(config.toString().getBytes());
        }
    }

    private void addExtension(String pluginName, String pluginBundle) throws FileNotFoundException, IOException {
        JSONObject config = null;
        try (FileInputStream input = new FileInputStream(context.getRealPath(extensionsConfig))) {
            config = readJSON(input);
        } catch (FileNotFoundException e) {
            config = new JSONObject();
        }
        if (config != null) {
            JSONObject extension = new JSONObject();
            extension.accumulate("bundle", pluginBundle);
            config.replace(pluginName,extension);
            storeExtensionsConfig(config);
        }
    }

    private void storeExtensionsConfig(JSONObject config) throws IOException {
        try (FileOutputStream output = new FileOutputStream(context.getRealPath(extensionsConfig))) {
            output.write(config.toString().getBytes());
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

    private void storeJsBundle(ZipInputStream zip, File file) throws FileNotFoundException, IOException {
        try(FileOutputStream outFile = new FileOutputStream(file)) {
            byte[] buffer = new byte[1024];
            int read = 0;
            while ((read = zip.read(buffer, 0, 1024)) >= 0) {
                outFile.write(buffer, 0, read);
           }
        }
        
    }
}
