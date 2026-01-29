export const STATE_INTERACTION_MAP_1 = {

    "layers": {
        "flat": [
            {
                "id": "test:states_training__51824df0-fac9-11f0-b714-1b62e8a515ce",
                "format": "image/png",
                "group": "Default.629d93b0-fac9-11f0-b714-1b62e8a515ce",
                "search": {
                    "url": "https://testserver/geoserver/wfs",
                    "type": "wfs"
                },
                "name": "te:states_training",
                "opacity": 1,
                "description": "",
                "layerFilter": {
                    "filters": []
                },
                "title": "states_training",
                "type": "wms",
                "url": "https://testserver/geoserver/wms",
                "bbox": {
                    "crs": "EPSG:4326",
                    "bounds": {
                        "minx": -124.78894161699102,
                        "miny": 24.955967,
                        "maxx": -66.969849,
                        "maxy": 49.371735
                    }
                },
                "visibility": true,
                "singleTile": false,
                "allowedSRS": {},
                "dimensions": [],
                "hideLoading": false,
                "handleClickOnLayer": false,
                "featureInfo": null,
                "catalogURL": "https://gs-stable.geo-solutions.it/geoserver/csw?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=test:states_training",
                "useForElevation": false,
                "hidden": false,
                "expanded": false,
                "params": {},
                "loading": false,
                "loadingError": false
            }
        ],
        "groups": [
            {
                "id": "Default",
                "title": "Default",
                "name": "Default",
                "nodes": [
                    {
                        "id": "Default.629d93b0-fac9-11f0-b714-1b62e8a515ce",
                        "title": "group",
                        "name": "629d93b0-fac9-11f0-b714-1b62e8a515ce",
                        "nodes": [
                            "test:states_training__51824df0-fac9-11f0-b714-1b62e8a515ce"
                        ],
                        "expanded": true,
                        "visibility": true
                    }
                ],
                "expanded": true,
                "visibility": true
            }
        ]
    },
    "widgets": {
        "dependencies": {
            "map.dependenciesMap": "map.dependenciesMap",
            "map.mapSync": "map.mapSync",
            "viewport": "map.bbox",
            "center": "map.center",
            "zoom": "map.zoom",
            "layers": "layers.flat",
            "groups": "layers.groups",
            "dimension.currentTime": "dimension.currentTime",
            "dimension.offsetTime": "dimension.offsetTime"
        },
        "containers": {
            "floating": {
                "widgets": [
                    {
                        "id": "53b5cfc0-fac9-11f0-b714-1b62e8a515ce",
                        "layer": {
                            "id": "test:states_training__51824df0-fac9-11f0-b714-1b62e8a515ce",
                            "format": "image/png",
                            "group": "Default.629d93b0-fac9-11f0-b714-1b62e8a515ce",
                            "search": {
                                "url": "https://testserver/geoserver/wfs",
                                "type": "wfs"
                            },
                            "name": "test:states_training",
                            "opacity": 1,
                            "description": "",
                            "layerFilter": {
                                "filters": []
                            },
                            "title": "states_training",
                            "type": "wms",
                            "url": "https://testserver/geoserver/wms",
                            "bbox": {
                                "crs": "EPSG:4326",
                                "bounds": {
                                    "minx": -124.78894161699102,
                                    "miny": 24.955967,
                                    "maxx": -66.969849,
                                    "maxy": 49.371735
                                }
                            },
                            "visibility": true,
                            "singleTile": false,
                            "allowedSRS": {},
                            "dimensions": [],
                            "hideLoading": false,
                            "handleClickOnLayer": false,
                            "featureInfo": null,
                            "catalogURL": "https://gs-stable.geo-solutions.it/geoserver/csw?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=test:states_training",
                            "useForElevation": false,
                            "hidden": false,
                            "expanded": false,
                            "params": {},
                            "loading": false,
                            "loadingError": false
                        },
                        "url": "https://testserver/geoserver/wms",
                        "legend": false,
                        "mapSync": true,
                        "cartesian": true,
                        "yAxis": true,
                        "widgetType": "filter",
                        "filters": [
                            {
                                "id": "54955a50-fac9-11f0-b714-1b62e8a515ce",
                                "layout": {
                                    "variant": "checkbox",
                                    "icon": "filter",
                                    "selectionMode": "multiple",
                                    "direction": "vertical",
                                    "label": "Filter 1",
                                    "titleStyle": {
                                        "fontSize": 14,
                                        "fontWeight": "normal",
                                        "fontStyle": "normal",
                                        "textColor": "#000000"
                                    }
                                },
                                "items": [],
                                "data": {
                                    "title": "",
                                    "layer": {
                                        "type": "wms",
                                        "format": "image/png",
                                        "featureInfo": null,
                                        "url": "https://testserver/geoserver/wms",
                                        "visibility": true,
                                        "dimensions": [],
                                        "name": "test:states_training",
                                        "title": "states_training",
                                        "description": "",
                                        "bbox": {
                                            "crs": "EPSG:4326",
                                            "bounds": {
                                                "minx": -124.78894161699102,
                                                "miny": 24.955967,
                                                "maxx": -66.969849,
                                                "maxy": 49.371735
                                            }
                                        },
                                        "links": [],
                                        "params": {},
                                        "allowedSRS": {},
                                        "catalogURL": "https://gs-stable.geo-solutions.it/geoserver/csw?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=test:states_training",
                                        "imageFormats": [],
                                        "infoFormats": [],
                                        "id": "test:states_training__51824df0-fac9-11f0-b714-1b62e8a515ce",
                                        "loading": false,
                                        "search": {
                                            "url": "https://testserver/geoserver/wfs",
                                            "type": "wfs"
                                        },
                                        "loadingError": false
                                    },
                                    "dataSource": "features",
                                    "valuesFrom": "grouped",
                                    "valueAttribute": "STATE_NAME",
                                    "labelAttribute": "STATE_NAME",
                                    "sortByAttribute": "STATE_NAME",
                                    "sortOrder": "ASC",
                                    "maxFeatures": 20,
                                    "filterComposition": "OR",
                                    "userDefinedItems": []
                                }
                            }
                        ],
                        "selectedFilterId": "54955a50-fac9-11f0-b714-1b62e8a515ce",
                        "selections": {
                            "54955a50-fac9-11f0-b714-1b62e8a515ce": []
                        },
                        "interactions": [
                            {
                                "id": "58057ad0-fac9-11f0-b714-1b62e8a515ce",
                                "source": {
                                    "nodePath": "widgets[53b5cfc0-fac9-11f0-b714-1b62e8a515ce][54955a50-fac9-11f0-b714-1b62e8a515ce]"
                                },
                                "target": {
                                    "nodePath": "map.layers[test:states_training__51824df0-fac9-11f0-b714-1b62e8a515ce]",
                                    "metaData": {
                                        "targetType": "applyFilter",
                                        "expectedDataType": "LAYER_FILTER",
                                        "attributeName": "layerFilter.filters",
                                        "constraints": {
                                            "layer": {
                                                "name": "test:states_training"
                                            }
                                        },
                                        "mode": "upsert"
                                    }
                                },
                                "configuration": {
                                    "forcePlug": false
                                },
                                "plugged": true,
                                "targetType": "applyFilter"
                            }
                        ],
                        "dataGrid": {
                            "w": 1,
                            "h": 1,
                            "x": 0,
                            "y": 0
                        }
                    },
                    {
                        "id": "746e1fb0-fac9-11f0-b714-1b62e8a515ce",
                        "layer": {
                            "id": "test:states_training__51824df0-fac9-11f0-b714-1b62e8a515ce",
                            "format": "image/png",
                            "group": "Default.629d93b0-fac9-11f0-b714-1b62e8a515ce",
                            "search": {
                                "url": "https://testserver/geoserver/wfs",
                                "type": "wfs"
                            },
                            "name": "test:states_training",
                            "opacity": 1,
                            "description": "",
                            "layerFilter": {
                                "filters": []
                            },
                            "title": "states_training",
                            "type": "wms",
                            "url": "https://testserver/geoserver/wms",
                            "bbox": {
                                "crs": "EPSG:4326",
                                "bounds": {
                                    "minx": -124.78894161699102,
                                    "miny": 24.955967,
                                    "maxx": -66.969849,
                                    "maxy": 49.371735
                                }
                            },
                            "visibility": true,
                            "singleTile": false,
                            "allowedSRS": {},
                            "dimensions": [],
                            "hideLoading": false,
                            "handleClickOnLayer": false,
                            "featureInfo": null,
                            "catalogURL": "https://gs-stable.geo-solutions.it/geoserver/csw?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=test:states_training",
                            "useForElevation": false,
                            "hidden": false,
                            "expanded": false,
                            "params": {},
                            "loading": false,
                            "loadingError": false
                        },
                        "url": "https://testserver/geoserver/wms",
                        "legend": false,
                        "mapSync": true,
                        "cartesian": true,
                        "yAxis": true,
                        "widgetType": "table",
                        "geomProp": "the_geom",
                        "options": {
                            "propertyName": [
                                {
                                    "name": "STATE_NAME"
                                }
                            ]
                        },
                        "dataGrid": {
                            "w": 1,
                            "h": 1,
                            "x": 0,
                            "y": 0
                        }
                    }
                ],
                "layouts": {
                    "md": [
                        {
                            "w": 2,
                            "h": 2,
                            "x": 4,
                            "y": 2,
                            "i": "53b5cfc0-fac9-11f0-b714-1b62e8a515ce",
                            "moved": false,
                            "static": false
                        },
                        {
                            "w": 2,
                            "h": 2,
                            "x": 2,
                            "y": 2,
                            "i": "746e1fb0-fac9-11f0-b714-1b62e8a515ce",
                            "moved": false,
                            "static": false
                        }
                    ]
                }
            }
        },
        "builder": {
            "map": null,
            "settings": {
                "step": 0
            }
        },
        "tray": true
    }

};

export const STATE_INTERACTION_DASH_1 = {
    "widgets": {
        "dependencies": {
            "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].dependenciesMap": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].dependenciesMap",
            "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].mapSync": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].mapSync",
            "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].viewport": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].bbox",
            "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].center": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].center",
            "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].zoom": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].zoom",
            "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].layers": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].layers",
            "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].groups": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].groups",
            "dimension.currentTime": "dimension.currentTime",
            "dimension.offsetTime": "dimension.offsetTime",
            "map.dependenciesMap": "map.dependenciesMap",
            "map.mapSync": "map.mapSync",
            "viewport": "map.bbox",
            "center": "map.center",
            "zoom": "map.zoom",
            "layers": "layers.flat",
            "groups": "layers.groups"
        },
        "containers": {
            "floating": {
                "widgets": [
                    {
                        "id": "4ae23420-fad2-11f0-9e1f-7900d8be1f6f",
                        "layer": {
                            "type": "wms",
                            "featureInfo": null,
                            "url": "https://testserver/geoserver/wms",
                            "visibility": true,
                            "dimensions": [],
                            "name": "test:states_training",
                            "title": "states_training",
                            "description": "",
                            "bbox": {
                                "crs": "EPSG:4326",
                                "bounds": {
                                    "minx": -124.78894161699102,
                                    "miny": 24.955967,
                                    "maxx": -66.969849,
                                    "maxy": 49.371735
                                }
                            },
                            "links": [],
                            "params": {},
                            "allowedSRS": {},
                            "imageFormats": [],
                            "infoFormats": [],
                            "search": {
                                "type": "wfs",
                                "url": "https://testserver/geoserver/wfs"
                            }
                        },
                        "url": "https://testserver/geoserver/wms",
                        "selectedFilterId": "4bd546b0-fad2-11f0-9e1f-7900d8be1f6f",
                        "widgetType": "filter",
                        "filters": [
                            {
                                "id": "4bd546b0-fad2-11f0-9e1f-7900d8be1f6f",
                                "layout": {
                                    "variant": "checkbox",
                                    "icon": "filter",
                                    "selectionMode": "multiple",
                                    "direction": "vertical",
                                    "label": "Filter 1",
                                    "titleStyle": {
                                        "fontSize": 14,
                                        "fontWeight": "normal",
                                        "fontStyle": "normal",
                                        "textColor": "#000000"
                                    }
                                },
                                "items": [],
                                "data": {
                                    "title": "",
                                    "layer": {
                                        "type": "wms",
                                        "featureInfo": null,
                                        "url": "https://testserver/geoserver/wms",
                                        "visibility": true,
                                        "dimensions": [],
                                        "name": "test:states_training",
                                        "title": "states_training",
                                        "description": "",
                                        "bbox": {
                                            "crs": "EPSG:4326",
                                            "bounds": {
                                                "minx": -124.78894161699102,
                                                "miny": 24.955967,
                                                "maxx": -66.969849,
                                                "maxy": 49.371735
                                            }
                                        },
                                        "links": [],
                                        "params": {},
                                        "allowedSRS": {},
                                        "imageFormats": [],
                                        "infoFormats": [],
                                        "search": {
                                            "type": "wfs",
                                            "url": "https://testserver/geoserver/wfs"
                                        }
                                    },
                                    "dataSource": "features",
                                    "valuesFrom": "grouped",
                                    "valueAttribute": "STATE_NAME",
                                    "labelAttribute": "STATE_NAME",
                                    "sortByAttribute": "STATE_NAME",
                                    "sortOrder": "ASC",
                                    "maxFeatures": 20,
                                    "filterComposition": "OR",
                                    "userDefinedItems": []
                                }
                            }
                        ],
                        "selections": {
                            "4bd546b0-fad2-11f0-9e1f-7900d8be1f6f": [
                                "Arkansas"
                            ]
                        },
                        "interactions": [
                            {
                                "id": "7d1af440-fad2-11f0-9e1f-7900d8be1f6f",
                                "source": {
                                    "nodePath": "widgets[4ae23420-fad2-11f0-9e1f-7900d8be1f6f][4bd546b0-fad2-11f0-9e1f-7900d8be1f6f]"
                                },
                                "target": {
                                    "nodePath": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].layers[test:states_training__5e262640-fad2-11f0-9e1f-7900d8be1f6f]",
                                    "metaData": {
                                        "targetType": "applyFilter",
                                        "expectedDataType": "LAYER_FILTER",
                                        "attributeName": "layerFilter.filters",
                                        "constraints": {
                                            "layer": {
                                                "name": "test:states_training"
                                            }
                                        },
                                        "mode": "upsert"
                                    }
                                },
                                "configuration": {
                                    "forcePlug": false
                                },
                                "plugged": true,
                                "targetType": "applyFilter"
                            }
                        ],
                        "layoutId": "47ad6ef0-fad2-11f0-9e1f-7900d8be1f6f",
                        "dataGrid": {
                            "w": 1,
                            "h": 1,
                            "x": 0,
                            "y": 0
                        }
                    },
                    {
                        "id": "5640f860-fad2-11f0-9e1f-7900d8be1f6f",
                        "layer": false,
                        "url": false,
                        "legend": false,
                        "mapSync": false,
                        "cartesian": true,
                        "yAxis": true,
                        "widgetType": "map",
                        "maps": [
                            {
                                "mapId": "5917e620-fad2-11f0-9e1f-7900d8be1f6f",
                                "name": "test",
                                "projection": "EPSG:900913",
                                "units": "m",
                                "center": {
                                    "x": -100.96893492506862,
                                    "y": 35.53460035719425,
                                    "crs": "EPSG:4326"
                                },
                                "zoom": 3,
                                "maxExtent": [
                                    -20037508.34,
                                    -20037508.34,
                                    20037508.34,
                                    20037508.34
                                ],
                                "groups": [{
                                    "id": "Default",
                                    "title": "Default",
                                    "name": "Default",
                                    "nodes": [
                                        {
                                            "id": "Default.629d93b0-fac9-11f0-b714-1b62e8a515ce",
                                            "title": "group",
                                            "name": "629d93b0-fac9-11f0-b714-1b62e8a515ce",
                                            "nodes": [
                                                "test:states_training__51824df0-fac9-11f0-b714-1b62e8a515ce"
                                            ],
                                            "expanded": true,
                                            "visibility": true
                                        }
                                    ],
                                    "expanded": true,
                                    "visibility": true
                                }],
                                "layers": [
                                    {
                                        "group": "Default",
                                        "type": "wms",
                                        "featureInfo": null,
                                        "url": "https://testserver/geoserver/wms",
                                        "visibility": true,
                                        "dimensions": [],
                                        "name": "test:states_training",
                                        "title": "states_training",
                                        "description": "",
                                        "bbox": {
                                            "crs": "EPSG:4326",
                                            "bounds": {
                                                "minx": -124.78894161699102,
                                                "miny": 24.955967,
                                                "maxx": -66.969849,
                                                "maxy": 49.371735
                                            }
                                        },
                                        "links": [],
                                        "params": {},
                                        "allowedSRS": {},
                                        "imageFormats": [],
                                        "infoFormats": [],
                                        "search": {
                                            "type": "wfs",
                                            "url": "https://testserver/geoserver/wfs"
                                        },
                                        "id": "test:states_training__5e262640-fad2-11f0-9e1f-7900d8be1f6f",
                                        "layerFilter": {
                                            "filters": [
                                                {
                                                    "id": "7d1af440-fad2-11f0-9e1f-7900d8be1f6f",
                                                    "format": "logic",
                                                    "version": "1.0.0",
                                                    "logic": "OR",
                                                    "filters": [
                                                        {
                                                            "format": "cql",
                                                            "version": "1.0.0",
                                                            "body": "\"STATE_NAME\"='Arkansas'",
                                                            "id": "[\"STATE_NAME\"='Arkansas']",
                                                            "filterId": "4bd546b0-fad2-11f0-9e1f-7900d8be1f6f"
                                                        }
                                                    ],
                                                    "appliedFromWidget": "4ae23420-fad2-11f0-9e1f-7900d8be1f6f"
                                                }
                                            ]
                                        },
                                        "expanded": false
                                    }
                                ],
                                "mapInfoControl": true,
                                "bbox": {
                                    "bounds": {
                                        "minx": -13020487.43272928,
                                        "miny": 3180105.1425066087,
                                        "maxx": -9459133.410866348,
                                        "maxy": 5293436.100535162
                                    },
                                    "crs": "EPSG:3857",
                                    "rotation": 0
                                },
                                "size": {
                                    "width": 182,
                                    "height": 108
                                },
                                "mapStateSource": "5640f860-fad2-11f0-9e1f-7900d8be1f6f",
                                "resolution": 19567.87924100512
                            }
                        ],
                        "selectedMapId": "5917e620-fad2-11f0-9e1f-7900d8be1f6f",
                        "mapStateSource": "__base_map__",
                        "layoutId": "47ad6ef0-fad2-11f0-9e1f-7900d8be1f6f",
                        "dataGrid": {
                            "w": 1,
                            "h": 1,
                            "x": 0,
                            "y": 0
                        }
                    },
                    {
                        "id": "87fb60c0-fad2-11f0-9e1f-7900d8be1f6f",
                        "layer": false,
                        "url": false,
                        "legend": false,
                        "mapSync": true,
                        "cartesian": true,
                        "yAxis": true,
                        "widgetType": "legend",
                        "dependenciesMap": {
                            "layers": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].layers",
                            "zoom": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].zoom",
                            "viewport": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].viewport",
                            "groups": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].groups",
                            "dependenciesMap": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].dependenciesMap",
                            "mapSync": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].mapSync"
                        },
                        "layoutId": "47ad6ef0-fad2-11f0-9e1f-7900d8be1f6f",
                        "dataGrid": {
                            "w": 1,
                            "h": 1,
                            "x": 0,
                            "y": 0
                        }
                    }
                ],
                "layouts": [
                    {
                        "id": "47ad6ef0-fad2-11f0-9e1f-7900d8be1f6f",
                        "name": "Main view",
                        "color": null,
                        "xxs": [],
                        "md": [
                            {
                                "w": 3,
                                "h": 1,
                                "x": 0,
                                "y": 0,
                                "i": "4ae23420-fad2-11f0-9e1f-7900d8be1f6f",
                                "moved": false,
                                "static": false
                            },
                            {
                                "w": 1,
                                "h": 1,
                                "x": 0,
                                "y": 2,
                                "i": "5640f860-fad2-11f0-9e1f-7900d8be1f6f",
                                "moved": false,
                                "static": false
                            },
                            {
                                "w": 1,
                                "h": 1,
                                "x": 0,
                                "y": 1,
                                "i": "87fb60c0-fad2-11f0-9e1f-7900d8be1f6f",
                                "moved": false,
                                "static": false
                            }
                        ]
                    }
                ],
                "layout": [
                    {
                        "w": 3,
                        "h": 1,
                        "x": 0,
                        "y": 0,
                        "i": "4ae23420-fad2-11f0-9e1f-7900d8be1f6f",
                        "moved": false,
                        "static": false
                    },
                    {
                        "w": 1,
                        "h": 1,
                        "x": 0,
                        "y": 2,
                        "i": "5640f860-fad2-11f0-9e1f-7900d8be1f6f",
                        "moved": false,
                        "static": false
                    },
                    {
                        "w": 1,
                        "h": 1,
                        "x": 0,
                        "y": 1,
                        "i": "87fb60c0-fad2-11f0-9e1f-7900d8be1f6f",
                        "moved": false,
                        "static": false
                    }
                ]
            }
        },
        "builder": {
            "map": null,
            "settings": {
                "step": 1
            },
            "editor": {
                "legend": false,
                "mapSync": true,
                "cartesian": true,
                "yAxis": true,
                "id": "87fb60c0-fad2-11f0-9e1f-7900d8be1f6f",
                "widgetType": "legend",
                "dependenciesMap": {
                    "layers": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].layers",
                    "zoom": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].zoom",
                    "viewport": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].viewport",
                    "groups": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].maps[5917e620-fad2-11f0-9e1f-7900d8be1f6f].groups",
                    "dependenciesMap": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].dependenciesMap",
                    "mapSync": "widgets[5640f860-fad2-11f0-9e1f-7900d8be1f6f].mapSync"
                }
            }
        },
        "tray": false
    }
};
