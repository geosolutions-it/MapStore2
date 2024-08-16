export default {
    "desktop": [
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
        "AddGroup", "MapFooter",
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
                "additionalCRS": {

                },
                "filterAllowedCRS": [
                    "EPSG:4326",
                    "EPSG:3857"
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
        "BurgerMenu",
        "Expander",
        "Undo",
        "Redo",
        {
            "name": "SearchServicesConfig",
            "cfg": {
                "containerClassName": "map-editor-search-config"
            }
        },
        "FeedbackMask"]
};
