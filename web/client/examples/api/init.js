var defaultPlugins = {
    "desktop": [
       {
          "name": "Map",
          "cfg": {
             "toolsOptions": {
                "scalebar": {
                   "leaflet": {
                      "position": "bottomright"
                   }
                }
             },
             "zoomControl": false
          }
       },
       {
          "name": "Help",
          "cfg": {
             "asPanel": false,
             "closeGlyph": "1-close"
          }
       },
       {
          "name": "Share",
          "cfg": {
             "closeGlyph": "1-close"
          }
       },
       {
          "name": "DrawerMenu",
          "cfg": {
             "glyph": "1-stilo",
             "buttonStyle": "primary",
             "buttonClassName": "square-button",
             "singleSection": true
          }
       },
       {
          "name": "Identify",
          "showIn": [
             "IdentifyBar",
             "Settings"
          ],
          "cfg": {
             "panelClassName": "modal-dialog info-panel modal-content",
             "headerClassName": "modal-header",
             "bodyClassName": "modal-body info-wrap",
             "asPanel": false,
             "headerGlyph": "",
             "glyph": "map-marker",
             "className": "square-button",
             "closeGlyph": "1-close",
             "wrapRevGeocode": false,
             "enableRevGeocode": true,
             "viewerOptions": {
                "container": "{context.ReactSwipe}",
                "header": "{context.SwipeHeader}",
                "headerOptions": {
                   "useButtons": true
                },
                "containerProps": {
                   "continuous": false
                },
                "collapsible": false
             }
          }
       },
       {
          "name": "Locate",
          "cfg": {
             "glyph": "1-position-1",
             "btnConfig": {
                "className": "square-button"
             }
          },
          "override": {
             "Toolbar": {
                "alwaysVisible": true
             }
          }
       },
       {
          "name": "TOC",
          "cfg": {
             "visibilityCheckType": "glyph",
             "settingsOptions": {
                "includeCloseButton": false,
                "closeGlyph": "1-close",
                "asModal": false,
                "buttonSize": "small"
             }
          },
          "override": {
             "DrawerMenu": {
                "glyph": "1-layer",
                "buttonConfig": {
                   "buttonClassName": "square-button no-border"
                }
             }
          }
       },
       {
          "name": "BackgroundSwitcher",
          "cfg": {
             "fluid": true,
             "columnProperties": {
                "xs": 12,
                "sm": 12,
                "md": 12
             }
          },
          "override": {
             "DrawerMenu": {
                "glyph": "1-map",
                "buttonConfig": {
                   "buttonClassName": "square-button no-border"
                }
             }
          }
       },
       {
          "name": "Measure",
          "cfg": {
             "showResults": false,
             "lineGlyph": "1-measure-lenght",
             "areaGlyph": "1-measure-area",
             "bearingGlyph": "1-bearing",
             "useButtonGroup": false
          },
          "override": {
             "DrawerMenu": {
                "glyph": "1-stilo",
                "buttonConfig": {
                   "buttonClassName": "square-button no-border"
                }
             }
          }
       },
       {
          "name": "MeasureResults",
          "cfg": {
             "closeGlyph": "1-close",
             "withPanelAsContainer": false
          }
       },
       {
          "name": "Print",
          "cfg": {
             "useFixedScales": false,
             "syncMapPreview": true,
             "mapPreviewOptions": {
                "enableScalebox": false,
                "enableRefresh": false
             },
             "closeGlyph": "1-close",
             "submitConfig": {
                "buttonConfig": {
                   "bsSize": "medium",
                   "bsStyle": "primary"
                },
                "glyph": ""
             },
             "previewOptions": {
                "buttonStyle": "primary"
             },
             "withPanelAsContainer": false
          }
       },
       {
          "name": "ShapeFile",
          "cfg": {
             "wrap": true,
             "wrapWithPanel": false,
             "closeGlyph": "1-close",
             "buttonSize": "small"
          }
       },
       {
          "name": "Settings",
          "hideFrom": [
             "Toolbar",
             "DrawerMenu"
          ],
          "cfg": {
             "wrapWithPanel": false,
             "closeGlyph": "1-close",
             "overrideSettings": {
                "history": false
             },
             "wrap": true
          }
       },
       {
          "name": "MetadataExplorer",
          "cfg": {
             "showGetCapLinks": false,
             "addAuthentication": false,
             "wrap": true,
             "wrapWithPanel": false,
             "closeGlyph": "1-close",
             "initialCatalogURL": {
                "csw": "http://demo.geo-solutions.it/geoserver/csw",
                "wms": "http://demo.geo-solutions.it/geoserver/wms"
             }
          }
       },
       "MousePosition",
       {
          "name": "Search",
          "cfg": {
             "withToggle": [
                "max-width: 768px",
                "min-width: 768px"
             ]
          }
       },
       {
          "name": "Toolbar",
          "id": "NavigationBar",
          "stateSelector": "toolbar",
          "cfg": {
             "buttonStyle": "primary",
             "id": "navigationBar"
          }
       },
       {
          "name": "Toolbar",
          "id": "IdentifyBar",
          "stateSelector": "identify",
          "cfg": {
             "buttonStyle": "primary",
             "pressedButtonStyle": "success",
             "id": "identifyBar"
          },
          "isDefault": false
       },
       "ScaleBox",
       {
          "name": "ZoomAll",
          "cfg": {
             "className": "square-button"
          }
       },
       {
          "name": "MapLoading",
          "cfg": {
             "className": "ms2-loading"
          },
          "override": {
             "Toolbar": {
                "alwaysVisible": true
             }
          }
       },
       {
          "name": "Snapshot",
          "cfg": {
             "wrap": true,
             "wrapWithPanel": false,
             "closeGlyph": "1-close",
             "buttonStyle": "primary"
          }
       },
       {
          "name": "ZoomIn",
          "override": {
             "Toolbar": {
                "alwaysVisible": true
             }
          }
       },
       {
          "name": "ZoomOut",
          "override": {
             "Toolbar": {
                "alwaysVisible": true
             }
          }
       },
       {
          "name": "Login",
          "cfg": {
             "nav": false,
             "menuProps": {
                "noCaret": true
             },
             "toolsCfg": [
                {
                   "buttonSize": "small",
                   "includeCloseButton": false,
                   "useModal": false,
                   "closeGlyph": "1-close"
                },
                {
                   "buttonSize": "small",
                   "includeCloseButton": false,
                   "useModal": false,
                   "closeGlyph": "1-close"
                },
                {
                   "buttonSize": "small",
                   "includeCloseButton": false,
                   "useModal": false,
                   "closeGlyph": "1-close"
                }
             ]
          }
       },
       "OmniBar",
       {
          "name": "BurgerMenu"
       },
       {
          "name": "Expander",
          "cfg": {
             "className": "square-button"
          }
       },
       {
          "name": "Undo",
          "cfg": {
             "glyph": "1-screen-backward",
             "buttonStyle": "primary",
             "btnConfig": {
                "className": "square-button"
             }
          }
       },
       {
          "name": "Redo",
          "cfg": {
             "glyph": "1-screen-forward",
             "buttonStyle": "primary",
             "btnConfig": {
                "className": "square-button"
             }
          }
       }
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
   {
      "name": "Map",
      "cfg": {
         "zoomControl": false
      }
   },
   "MousePosition",
   {
      "name": "Toolbar",
      "cfg": {
         "buttonStyle": "primary",
         "style": {
            "top": "70px"
         }
      }
   },
   {
      "name": "ZoomAll",
      "cfg": {
         "className": "square-button"
      }
   },
   {
      "name": "Expander",
      "cfg": {
         "className": "square-button"
      }
   },
   {
      "name": "ZoomIn",
      "override": {
         "Toolbar": {
            "alwaysVisible": true
         }
      }
   },
   {
      "name": "ZoomOut",
      "override": {
         "Toolbar": {
            "alwaysVisible": true
         }
      }
   },
   "ScaleBox",
   {
      "name": "OmniBar",
      "cfg": {
         "style": {
            "right": "5px",
            "top": "5px"
         }
      }
   },
   {
      "name": "Search"
   },
   {
      "name": "DrawerMenu",
      "cfg": {
         "glyph": "1-stilo",
         "buttonStyle": "primary",
         "buttonClassName": "square-button",
         "singleSection": true,
         "menuButtonStyle": {
            "position": "absolute",
            "top": 0
         }
      }
   },
   {
      "name": "TOC",
      "cfg": {
         "visibilityCheckType": "glyph",
         "settingsOptions": {
            "includeCloseButton": false,
            "closeGlyph": "1-close",
            "asModal": false,
            "buttonSize": "small"
         }
      },
      "override": {
         "DrawerMenu": {
            "glyph": "1-layer",
            "buttonConfig": {
               "buttonClassName": "square-button no-border"
            }
         }
      }
   },
   {
      "name": "BackgroundSwitcher",
      "cfg": {
         "fluid": true,
         "columnProperties": {
            "xs": 12,
            "sm": 12,
            "md": 12
         }
      },
      "override": {
         "DrawerMenu": {
            "glyph": "1-map",
            "buttonConfig": {
               "buttonClassName": "square-button no-border"
            }
         }
      }
   },
   "BurgerMenu",
   {
      "name": "Settings",
      "cfg": {
         "wrapWithPanel": false,
         "closeGlyph": "1-close",
         "overrideSettings": {
            "history": false
         },
         "wrap": true
      }
   },
   {
      "name": "Identify",
      "cfg": {
         "panelClassName": "modal-dialog info-panel modal-content",
         "headerClassName": "modal-header",
         "bodyClassName": "modal-body info-wrap",
         "asPanel": false,
         "headerGlyph": "",
         "glyph": "map-marker",
         "className": "square-button",
         "closeGlyph": "1-close",
         "wrapRevGeocode": false,
         "enableRevGeocode": true,
         "viewerOptions": {
            "container": "{context.ReactSwipe}",
            "header": "{context.SwipeHeader}",
            "headerOptions": {
               "useButtons": true
            },
            "containerProps": {
               "continuous": false
            },
            "collapsible": false
         }
      }
    }]};

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
