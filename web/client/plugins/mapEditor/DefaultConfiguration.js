/**
 * Get plugin name from either string or object format
 */
const getPluginName = (plugin) => {
    return typeof plugin === "string" ? plugin : plugin?.name;
};

export default (overridePluginsConfig = []) => {
    const basePlugins = [
        {
            "name": "Map",
            "cfg": {
                "mapOptions": {
                    "openlayers": {
                        "interactions": {
                            "pinchRotate": false,
                            "altShiftDragRotate": false
                        },
                        "attribution": {
                            "container": "#footer-attribution-container"
                        }
                    },
                    "leaflet": {
                        "attribution": {
                            "container": "#footer-attribution-container"
                        }
                    }
                },
                "toolsOptions": {
                    "scalebar": {
                        "container": "#footer-scalebar-container"
                    }
                }
            }
        }, "DrawerMenu", "Annotations", "BackgroundSelector",
        {
            "name": "Identify",
            "cfg": {
                "showHighlightFeatureButton": true,
                "viewerOptions": {
                    "container": "{context.ReactSwipe}"
                }
            },
            "override": {
                "Toolbar": {
                    "position": 11
                }
            }
        },
        {
            "name": "Locate",
            "override": {
                "Toolbar": {
                    "alwaysVisible": true
                }
            }
        },
        {
            "name": "SecurityPopup",
            "override": {
                "MetadataExplorer": {
                    // this priority is used to ensure that the main component is not included
                    "priority": 1
                }
            }
        },
        {
            "name": "TOC",
            "cfg": {
                "activateQueryTool": false,
                "activateAddLayerButton": true,
                "activateAddGroupButton": true,
                "activateMetedataTool": false,
                "addLayersPermissions": true,
                "removeLayersPermissions": true,
                "sortingPermissions": true,
                "addGroupsPermissions": true,
                "removeGroupsPermissions": true,
                "activateLayerFilterTool": false
            }
        },
        "AddGroup",
        {
            "name": "MapFooter",
            "cfg": {
                "containerPosition": "footer"
            }
        },
        "TOCItemsSettings",
        "MapImport",
        "MapExport",
        {
            "name": "Settings",
            "cfg": {
                "wrap": true
            }
        },
        {
            "name": "MetadataExplorer",
            "cfg": {
                "wrap": true
            }
        }, {
            "name": "CRSSelector",
            "cfg": {
                "availableProjections": [
                    { "value": "EPSG:4326", "label": "EPSG:4326" },
                    { "value": "EPSG:3857", "label": "EPSG:3857" }
                ],
                "allowedRoles": [
                    "ADMIN"
                ]
            }
        },
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
            "cfg": {
                "id": "navigationBar"
            }
        },
        "ScaleBox", {
            "name": "ZoomAll",
            "override": {
                "Toolbar": {
                    "alwaysVisible": true
                }
            }
        }, {
            "name": "MapLoading",
            "override": {
                "Toolbar": {
                    "alwaysVisible": true
                }
            }
        }, {
            "name": "ZoomIn",
            "override": {
                "Toolbar": {
                    "alwaysVisible": true
                }
            }
        }, {
            "name": "ZoomOut",
            "override": {
                "Toolbar": {
                    "alwaysVisible": true
                }
            }
        },
        "OmniBar",
        {
            "name": "SidebarMenu",
            "cfg": {
                "containerPosition": "columns"
            }
        },
        "Expander",
        "Undo",
        "Redo",
        {
            "name": "SearchServicesConfig",
            "cfg": {
                "containerClassName": "map-editor-search-config"
            }
        },
        "FeedbackMask"
    ];

    const allPlugins = [...basePlugins, ...overridePluginsConfig];
    const uniquePlugins = [
        ...new Map(allPlugins.map(plugin => [getPluginName(plugin), plugin])).values()
    ];
    return {
        "desktop": uniquePlugins
    };
};
