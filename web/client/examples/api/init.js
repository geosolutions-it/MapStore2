/*eslint-disable */
function init() {
/* eslint-enable */
    var cfg;
    var cfgUrl;
    var theme;
    var embeddedPlugins;
    var pluginsCfg;

    /*eslint-disable */
    cfg = MapStore2.loadConfigFromStorage('mapstore.example.plugins.' + MapStore2.getParamFromRequest('map'));
    cfgUrl = MapStore2.getParamFromRequest('config') || 'config.json';
    theme = MapStore2.getParamFromRequest('theme');
    /* eslint-enable */
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
            {
                "name": "BackgroundSelector",
                "cfg": {
                    "dimensions": {
                        "side": 65,
                        "sidePreview": 65,
                        "frame": 3,
                        "margin": 5,
                        "label": false,
                        "vertical": true
                    }
                }
            },
            {
                "name": "TOCItemsSettings",
                "cfg": {
                    "width": 300,
                    "showFeatureInfoTab": false
                }
            },
            {
                "name": "Identify",
                "cfg": {
                    "position": "right",
                    "size": 0.4,
                    "fluid": true,
                    "viewerOptions": {
                        "container": "{context.ReactSwipe}"
                    }
                }
            },
            "FullScreen"
        ]};
    /*eslint-disable */
    pluginsCfg = cfg && MapStore2.buildPluginsCfg(cfg.pluginsCfg.standard, cfg.userCfg) || embeddedPlugins;
    MapStore2.create('container', {
        plugins: pluginsCfg,
        configUrl: cfgUrl,
        initialState: cfg && cfg.state && {
            defaultState: cfg.state
        } || null,
        style: cfg && cfg.customStyle,
        theme: theme ? {
            theme: theme,
            path: '../../dist/themes'
        } : {
            path: '../../dist/themes'
        }
    });
    MapStore2.onAction('CHANGE_MAP_VIEW', function(action) {
        console.log('ZOOM: ' + action.zoom);
    });
    MapStore2.onStateChange(function(map) {
        console.log('STATE ZOOM: ' + map.zoom);
    }, function(state) {
        return (state.map && state.map.present) || state.map || {}
    });
    MapStore2.onAction("MAP_CONFIG_LOADED", function(action) {
        var layers = action && action.config && action.config.map && action.config.map.layers;
        var layerIndex = layers.findIndex(function(e) {
            return e.name === "nurc:Arc_Sample";
        });
        if (layerIndex >= 0) {
            var layer = layers[layerIndex];
            document.querySelector('#ck').disabled = false;
            document.querySelector('#ck').addEventListener('change', function(event) {
                MapStore2.triggerAction({
                  type: 'CHANGE_LAYER_PROPERTIES',
                  newProperties: {
                    visibility: event.target.checked
                  },
                  layer: layer.id
                });
            });
        }

    });
    document.getElementById("zoomToUSA").addEventListener("click", function() {
        MapStore2.triggerAction({
          type: 'ZOOM_TO_EXTENT',
          extent: {
            minx: '-124.731422',
            miny: '24.955967',
            maxx: '-66.969849',
            maxy: '49.371735'
          },
          crs: 'EPSG:4326'
      });
    });
    /* eslint-enable */
}
