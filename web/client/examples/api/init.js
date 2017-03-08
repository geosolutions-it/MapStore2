var defaultPlugins = {
    "desktop": [
          "Map",
          "Help",
          "Share",
          "DrawerMenu",
          "Identify",
          "Locate",
          "TOC",
          "BackgroundSwitcher",
          "Measure",
          "MeasureResults",
          "Print",
          "ShapeFile",
          "Settings",
          "MetadataExplorer",
          "MousePosition",
          "Toolbar",
          "ScaleBox",
          "ZoomAll",
          "MapLoading",
          "Snapshot",
          "ZoomIn",
          "ZoomOut",
          "Login",
          "OmniBar",
          "BurgerMenu",
          "Expander",
          "Undo",
          "Redo"
    ]
};

function mergeDefaultConfig(pluginName, cfg) {
    var propertyName;
    var i;
    var result;
    for (i = 0; i < defaultPlugins.desktop.length; i++) {
        if (defaultPlugins.desktop[i].name === pluginName) {
            result = defaultPlugins.desktop[i].cfg;
            for (propertyName in cfg) {
                if (cfg.hasOwnProperty(propertyName)) {
                    result[propertyName] = cfg[propertyName];
                }
            }
            return result;
        }
    }
    return cfg;
}

function buildPluginsCfg(plugins, cfg) {
    var pluginsCfg = [];
    var i;
    for (i = 0; i < plugins.length; i++) {
        if (cfg[plugins[i] + "Plugin"]) {
            pluginsCfg.push({
                name: plugins[i],
                cfg: mergeDefaultConfig(plugins[i], cfg[plugins[i] + "Plugin"])
            });
        } else {
            pluginsCfg.push({
                name: plugins[i],
                cfg: mergeDefaultConfig(plugins[i], {})
            });
        }
    }
    return {
        mobile: pluginsCfg,
        desktop: pluginsCfg
    };
}
/*eslint-disable */
function init() {
/*eslint-enable */
    var mapName;
    var params;
    var param;
    var i;
    var cfg;
    var loaded;
    var defaultState;
    var embeddedPlugins;
    var pluginsCfg;
    var initialDefaultState;

    if (window.location.search) {
        params = window.location.search.substring(1).split('&');
        for (i = 0; i < params.length; i++) {
            param = params[i].split('=');
            if (param[0] === 'map') {
                mapName = param[1];
            }
        }
    }

    if (mapName) {
        loaded = localStorage.getItem('mapstore.example.plugins.' + mapName);
        if (loaded) {
            cfg = JSON.parse(loaded);
        }
    }

    defaultState = {
        controls: {
            toolbar: {
                active: null,
                expanded: false
            },
            drawer: {
                enabled: false,
                menu: "1"
            }
        }
    };
    embeddedPlugins = {
        "desktop": [
            "Map",
            "MousePosition",
            "Toolbar",
            "ZoomAll",
            "Expander",
            "ZoomIn",
            "ZoomOut",
            "ScaleBox",
            "OmniBar",
            "Search",
            "DrawerMenu",
            "TOC",
            "BackgroundSwitcher",
            "BurgerMenu",
            "Identify"
      ]};

    pluginsCfg = cfg && buildPluginsCfg(cfg.pluginsCfg.standard, cfg.userCfg) || embeddedPlugins;
    initialDefaultState = cfg && {} || defaultState;
    /*eslint-disable */
    MapStore2.create('container', {
    /*eslint-enable */
        plugins: pluginsCfg,
        initialState: {
            defaultState: initialDefaultState
        },
        storeOpts: {
            persist: {
                whitelist: ['security']
            }
        }
    });
}
