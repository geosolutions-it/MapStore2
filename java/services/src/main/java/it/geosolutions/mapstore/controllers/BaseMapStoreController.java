package it.geosolutions.mapstore.controllers;

import javax.servlet.ServletContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

/**
 * Base class that provides the main configured variables
 * Can be configured using the following properties:
 *  - datadir.location absolute path of a folder where configuration files are fetched from (default: empty)
 *  - overrides.config: optional properties file path where overrides for the base config file are stored (default: empty)
 *  - overrides.mappings: optional list of mappings from the override configuration files, to the configuration files properties (default: empty)
 *    format: <json_path>=<propertyName>,...,<json_path>=<propertyName>
 *    example: header.height=headerHeight,header.url=headerUrl
 *
 * @author Lorenzo Natali, GeoSolutionsGroup
 *
 */
public abstract class BaseMapStoreController {

	@Autowired
    private ServletContext context;

    @Value("${datadir.location:}") private String dataDir = "";
	@Value("${overrides.mappings:}") private String mappings;
    @Value("${overrides.config:}") private String overrides = "";
    @Value("${extensions.folder:extensions}") private String extensionsFolder = "extensions";
    @Value("${extensions.registry:extensions.json}") private String extensionsConfig = "extensions.json";
    @Value("${context.configs.folder:configs}") private String configsFolder = "configs";
    @Value("${context.plugins.config:pluginsConfig.json}") private String pluginsConfig = "pluginsConfig.json";
    @Value("${context.plugins.savepatch:true}") private Boolean pluginsConfigAsPatch = true;

    public void setContext(ServletContext context) {
        this.context = context;
    }

    public void setDataDir(String dataDir) {
        this.dataDir = dataDir;
    }

    public void setMappings(String mappings) {
        this.mappings = mappings;
    }

    public void setOverrides(String overrides) {
        this.overrides = overrides;
    }
    public String getConfigsFolder() {
		return configsFolder;
	}

	public void setConfigsFolder(String configsFolder) {
		this.configsFolder = configsFolder;
	}

	public ServletContext getContext() {
		return context;
	}
	public void setBundlesPath(String bundlesPath) {
        this.extensionsFolder = bundlesPath;
    }

    public void setExtensionsConfig(String extensionsConfig) {
        this.extensionsConfig = extensionsConfig;
    }

    public void setPluginsConfig(String pluginsConfig) {
        this.pluginsConfig = pluginsConfig;
    }

    public void setPluginsConfigAsPatch(Boolean pluginsConfigAsPatch) {
        this.pluginsConfigAsPatch = pluginsConfigAsPatch;
    }
    public String getExtensionsFolder() {
 		return extensionsFolder;
 	}

 	public void setExtensionsFolder(String extensionsFolder) {
 		this.extensionsFolder = extensionsFolder;
 	}

 	public String getDataDir() {
 		return dataDir;
 	}

 	public String getMappings() {
 		return mappings;
 	}

 	public String getOverrides() {
 		return overrides;
 	}

 	public String getExtensionsConfig() {
 		return extensionsConfig;
 	}

 	public String getPluginsConfig() {
 		return pluginsConfig;
 	}

 	public Boolean getPluginsConfigAsPatch() {
 		return pluginsConfigAsPatch;
 	}
}
