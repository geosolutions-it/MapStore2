/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';
import dependenciesToWidget, {buildDependencies} from '../dependenciesToWidget';

describe('dependenciesToWidget enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('dependency transformation', (done) => {
        const Sink = dependenciesToWidget(createSink( props => {
            expect(props).toExist();
            expect(props.dependencies.x).toBe("a");
            done();
        }));
        ReactDOM.render(<Sink dependenciesMap={{x: "b"}} dependencies={{b: "a"}}/>, document.getElementById("container"));
    });
    it('dependency transformation, avoid loop', (done) => {

        const dependencies = {
            "widgets[c6656090-3de1-11ea-8ee8-c127e39ddf83].dependenciesMap": {
                mapSync: "widgets[cf58ca20-3de1-11ea-8ee8-c127e39ddf83].mapSync",
                zoom: "widgets[cf58ca20-3de1-11ea-8ee8-c127e39ddf83].map.zoom",
                dependenciesMap: "widgets[cf58ca20-3de1-11ea-8ee8-c127e39ddf83].dependenciesMap"
            },
            "widgets[c6656090-3de1-11ea-8ee8-c127e39ddf83].mapSync": true,
            "widgets[c6656090-3de1-11ea-8ee8-c127e39ddf83].map.zoom": 4,
            "widgets[cf58ca20-3de1-11ea-8ee8-c127e39ddf83].dependenciesMap": {
                zoom: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].map.zoom",
                mapSync: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].mapSync",
                dependenciesMap: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].dependenciesMap"
            },
            "widgets[cf58ca20-3de1-11ea-8ee8-c127e39ddf83].mapSync": true,
            "widgets[cf58ca20-3de1-11ea-8ee8-c127e39ddf83].map.zoom": 4,
            "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].dependenciesMap": {
                zoom: "widgets[c6656090-3de1-11ea-8ee8-c127e39ddf83].map.zoom",
                mapSync: "widgets[c6656090-3de1-11ea-8ee8-c127e39ddf83].mapSync",
                dependenciesMap: "widgets[c6656090-3de1-11ea-8ee8-c127e39ddf83].dependenciesMap"
            },
            "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].mapSync": true,
            "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].map.center": {x: -107.92361235618598, y: 37.28025446000009, crs: "EPSG:4326"},
            "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].map.zoom": 4
        };
        const dependenciesMap = {
            center: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].map.center",
            zoom: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].map.zoom",
            filter: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].filter",
            quickFilters: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].quickFilters",
            layer: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].layer",
            options: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].options",
            mapSync: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].mapSync",
            dependenciesMap: "widgets[d7e73050-3de1-11ea-8ee8-c127e39ddf83].dependenciesMap"
        };
        const Sink = dependenciesToWidget(createSink( props => {
            expect(props).toExist();
            expect(props.dependencies.zoom).toBe(4);
            // if there was a loop an maximum call stack exceeded error would be thrown
            done();
        }));
        ReactDOM.render(<Sink
            id="c6656090-3de1-11ea-8ee8-c127e39ddf83"
            dependenciesMap={dependenciesMap}
            dependencies={dependencies}
        />, document.getElementById("container"));
    });
    it('Return dependencies if there is no map', () => {
        const deps = {
            "widgets[a51221e0-2826-11ec-b226-3528a82f37ea].mapSync": false,
            "widgets[a51221e0-2826-11ec-b226-3528a82f37ea].map.viewport": {
                "bounds": {
                    "minx": 993171.584961808,
                    "miny": 5118063.5547720585,
                    "maxx": 1506828.4150381924,
                    "maxy": 5621936.44522794
                },
                "crs": "EPSG:3857",
                "rotation": 0
            },
            "widgets[a51221e0-2826-11ec-b226-3528a82f37ea].map.center": {
                "x": 11.22894105149402,
                "y": 43.380053862794,
                "crs": "EPSG:4326"
            },
            "widgets[a51221e0-2826-11ec-b226-3528a82f37ea].map.zoom": 5,
            "widgets[a51221e0-2826-11ec-b226-3528a82f37ea].map.layers": [
                {
                    "type": "osm",
                    "title": "Open Street Map",
                    "name": "mapnik",
                    "source": "osm",
                    "group": "background",
                    "visibility": true,
                    "id": "mapnik__0"
                },
                {
                    "type": "tileprovider",
                    "title": "NASAGIBS Night 2012",
                    "provider": "NASAGIBS.ViirsEarthAtNight2012",
                    "name": "Night2012",
                    "source": "nasagibs",
                    "group": "background",
                    "visibility": false,
                    "id": "Night2012__1"
                },
                {
                    "type": "tileprovider",
                    "title": "OpenTopoMap",
                    "provider": "OpenTopoMap",
                    "name": "OpenTopoMap",
                    "source": "OpenTopoMap",
                    "group": "background",
                    "visibility": false,
                    "id": "OpenTopoMap__2"
                },
                {
                    "format": "image/jpeg",
                    "group": "background",
                    "name": "s2cloudless:s2cloudless",
                    "opacity": 1,
                    "title": "Sentinel 2 Cloudless",
                    "type": "wms",
                    "url": [
                        "https://1maps.geo-solutions.it/geoserver/wms",
                        "https://2maps.geo-solutions.it/geoserver/wms",
                        "https://3maps.geo-solutions.it/geoserver/wms",
                        "https://4maps.geo-solutions.it/geoserver/wms",
                        "https://5maps.geo-solutions.it/geoserver/wms",
                        "https://6maps.geo-solutions.it/geoserver/wms"
                    ],
                    "source": "s2cloudless",
                    "visibility": false,
                    "singleTile": false,
                    "id": "s2cloudless:s2cloudless__3"
                },
                {
                    "source": "ol",
                    "group": "background",
                    "title": "Empty Background",
                    "fixed": true,
                    "type": "empty",
                    "visibility": false,
                    "args": [
                        "Empty Background",
                        {
                            "visibility": false
                        }
                    ],
                    "id": "undefined__4"
                }
            ],
            "widgets[abce1200-2826-11ec-b226-3528a82f37ea].dependenciesMap": {
                "center": "widgets[a51221e0-2826-11ec-b226-3528a82f37ea].map.center",
                "zoom": "widgets[a51221e0-2826-11ec-b226-3528a82f37ea].map.zoom",
                "filter": "widgets[a51221e0-2826-11ec-b226-3528a82f37ea].filter",
                "quickFilters": "widgets[a51221e0-2826-11ec-b226-3528a82f37ea].quickFilters",
                "layer": "widgets[a51221e0-2826-11ec-b226-3528a82f37ea].layer",
                "options": "widgets[a51221e0-2826-11ec-b226-3528a82f37ea].options",
                "mapSync": "widgets[a51221e0-2826-11ec-b226-3528a82f37ea].mapSync",
                "dependenciesMap": "widgets[a51221e0-2826-11ec-b226-3528a82f37ea].dependenciesMap"
            },
            "widgets[abce1200-2826-11ec-b226-3528a82f37ea].mapSync": true,
            "widgets[abce1200-2826-11ec-b226-3528a82f37ea].map.viewport": {
                "bounds": {
                    "minx": 993171.584961808,
                    "miny": 5118063.5547720585,
                    "maxx": 1506828.4150381924,
                    "maxy": 5621936.44522794
                },
                "crs": "EPSG:3857",
                "rotation": 0
            },
            "widgets[abce1200-2826-11ec-b226-3528a82f37ea].map.center": {
                "x": 11.22894105149402,
                "y": 43.380053862794,
                "crs": "EPSG:4326"
            },
            "widgets[abce1200-2826-11ec-b226-3528a82f37ea].map.zoom": 5,
            "widgets[abce1200-2826-11ec-b226-3528a82f37ea].map.layers": [
                {
                    "type": "osm",
                    "title": "Open Street Map",
                    "name": "mapnik",
                    "source": "osm",
                    "group": "background",
                    "visibility": true,
                    "id": "mapnik__0"
                },
                {
                    "type": "tileprovider",
                    "title": "NASAGIBS Night 2012",
                    "provider": "NASAGIBS.ViirsEarthAtNight2012",
                    "name": "Night2012",
                    "source": "nasagibs",
                    "group": "background",
                    "visibility": false,
                    "id": "Night2012__1"
                },
                {
                    "type": "tileprovider",
                    "title": "OpenTopoMap",
                    "provider": "OpenTopoMap",
                    "name": "OpenTopoMap",
                    "source": "OpenTopoMap",
                    "group": "background",
                    "visibility": false,
                    "id": "OpenTopoMap__2"
                },
                {
                    "format": "image/jpeg",
                    "group": "background",
                    "name": "s2cloudless:s2cloudless",
                    "opacity": 1,
                    "title": "Sentinel 2 Cloudless",
                    "type": "wms",
                    "url": [
                        "https://1maps.geo-solutions.it/geoserver/wms",
                        "https://2maps.geo-solutions.it/geoserver/wms",
                        "https://3maps.geo-solutions.it/geoserver/wms",
                        "https://4maps.geo-solutions.it/geoserver/wms",
                        "https://5maps.geo-solutions.it/geoserver/wms",
                        "https://6maps.geo-solutions.it/geoserver/wms"
                    ],
                    "source": "s2cloudless",
                    "visibility": false,
                    "singleTile": false,
                    "id": "s2cloudless:s2cloudless__3"
                },
                {
                    "source": "ol",
                    "group": "background",
                    "title": "Empty Background",
                    "fixed": true,
                    "type": "empty",
                    "visibility": false,
                    "args": [
                        "Empty Background",
                        {
                            "visibility": false
                        }
                    ],
                    "id": "undefined__4"
                }
            ],
            "layers": []
        };
        const originalWidgetId = 'abce1200-2826-11ec-b226-3528a82f37ea';
        const response = buildDependencies(null, deps, originalWidgetId);
        expect(response).toBe(deps);
    });
    it('Return dependencies if there is a parent table', () => {
        const dependencyMap = {
            "viewport": "widgets[3d418c80-9030-11ee-b036-b16bb8d06c94].maps[3800a3a0-9030-11ee-b036-b16bb8d06c94].viewport",
            "layers": "widgets[3d418c80-9030-11ee-b036-b16bb8d06c94].maps[3800a3a0-9030-11ee-b036-b16bb8d06c94].layers",
            "filter": "widgets[3d418c80-9030-11ee-b036-b16bb8d06c94].maps[3800a3a0-9030-11ee-b036-b16bb8d06c94].filter",
            "quickFilters": "widgets[3d418c80-9030-11ee-b036-b16bb8d06c94].maps[3800a3a0-9030-11ee-b036-b16bb8d06c94].quickFilters",
            "layer": "widgets[3d418c80-9030-11ee-b036-b16bb8d06c94].maps[3800a3a0-9030-11ee-b036-b16bb8d06c94].layer",
            "options": "widgets[3d418c80-9030-11ee-b036-b16bb8d06c94].maps[3800a3a0-9030-11ee-b036-b16bb8d06c94].options",
            "mapSync": "widgets[3d418c80-9030-11ee-b036-b16bb8d06c94].mapSync",
            "dependenciesMap": "widgets[3d418c80-9030-11ee-b036-b16bb8d06c94].dependenciesMap"
        };
        const deps = {
            "widgets[3d418c80-9030-11ee-b036-b16bb8d06c94].dependenciesMap": {
                "filter": "widgets[34792a90-9030-11ee-b036-b16bb8d06c94].filter",
                "quickFilters": "widgets[34792a90-9030-11ee-b036-b16bb8d06c94].quickFilters",
                "layer": "widgets[34792a90-9030-11ee-b036-b16bb8d06c94].layer",
                "options": "widgets[34792a90-9030-11ee-b036-b16bb8d06c94].options",
                "dependenciesMap": "widgets[34792a90-9030-11ee-b036-b16bb8d06c94].dependenciesMap",
                "mapSync": "widgets[34792a90-9030-11ee-b036-b16bb8d06c94].mapSync"
            },
            "widgets[3d418c80-9030-11ee-b036-b16bb8d06c94].mapSync": true,
            "widgets[3d418c80-9030-11ee-b036-b16bb8d06c94].maps[3800a3a0-9030-11ee-b036-b16bb8d06c94].viewport": {
                "bounds": {
                    "minx": -10428653.241920743,
                    "miny": 2596212.3657196583,
                    "maxx": -8237050.76692817,
                    "maxy": 3907260.274867002
                },
                "crs": "EPSG:3857",
                "rotation": 0
            },
            "widgets[3d418c80-9030-11ee-b036-b16bb8d06c94].maps[3800a3a0-9030-11ee-b036-b16bb8d06c94].center": {
                "x": -83.83843600000002,
                "y": 28.021909206829974,
                "crs": "EPSG:4326"
            },
            "widgets[3d418c80-9030-11ee-b036-b16bb8d06c94].maps[3800a3a0-9030-11ee-b036-b16bb8d06c94].zoom": 5,
            "widgets[3d418c80-9030-11ee-b036-b16bb8d06c94].maps[3800a3a0-9030-11ee-b036-b16bb8d06c94].layers": [
                {
                    "type": "osm",
                    "title": "Open Street Map",
                    "name": "mapnik",
                    "source": "osm",
                    "group": "background",
                    "visibility": true,
                    "id": "mapnik__0"
                },
                {
                    "type": "wms",
                    "featureInfo": null,
                    "url": "https://gs-stable.geosolutionsgroup.com/geoserver/wms",
                    "visibility": true,
                    "dimensions": [

                    ],
                    "name": "gs:us_states",
                    "title": "States of US",
                    "description": "",
                    "bbox": {
                        "crs": "EPSG:4326",
                        "bounds": {
                            "minx": -124.73142200000001,
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
                        "url": "https://gs-stable.geosolutionsgroup.com/geoserver/wfs"
                    },
                    "id": "gs:us_states__3bb39980-9030-11ee-b036-b16bb8d06c94"
                }
            ],
            "layers": [],
            "widgets[34792a90-9030-11ee-b036-b16bb8d06c94].quickFilters": {
                "STATE_NAME": {
                    "rawValue": "florida",
                    "value": "florida",
                    "operator": "ilike",
                    "type": "string",
                    "attribute": "STATE_NAME"
                }
            },
            "widgets[34792a90-9030-11ee-b036-b16bb8d06c94].mapSync": false,
            "widgets[34792a90-9030-11ee-b036-b16bb8d06c94].layer": {
                "type": "wms",
                "featureInfo": null,
                "url": "https://gs-stable.geosolutionsgroup.com/geoserver/wms",
                "visibility": true,
                "dimensions": [

                ],
                "name": "gs:us_states",
                "title": "States of US",
                "description": "",
                "bbox": {
                    "crs": "EPSG:4326",
                    "bounds": {
                        "minx": -124.73142200000001,
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
                    "url": "https://gs-stable.geosolutionsgroup.com/geoserver/wfs"
                }
            },
            "widgets[34792a90-9030-11ee-b036-b16bb8d06c94].options": {
                "propertyName": [{"name": "STATE_NAME"}, {"name": "STATE_FIPS"}, {"name": "SUB_REGION"}, {"name": "STATE_ABBR"}, {"name": "LAND_KM"}, {"name": "WATER_KM"}, {"name": "PERSONS"}, {"name": "FAMILIES"}, {"name": "HOUSHOLD"}, {"name": "MALE"}, {"name": "FEMALE"}, {"name": "WORKERS"}, {"name": "DRVALONE"}, {"name": "CARPOOL"}, {"name": "PUBTRANS"}, {"name": "EMPLOYED"}, {"name": "UNEMPLOY"}, {"name": "SERVICE"}, {"name": "MANUAL"}, {"name": "P_MALE"}, {"name": "P_FEMALE"}, {"name": "SAMP_POP"}]
            }
        };
        const response = buildDependencies(dependencyMap, deps, "e81849f0-9404-11ee-b8a8-2f8d898ee742");
        expect(response).toEqual({
            viewport: {bounds: {minx: -10428653.241920743, miny: 2596212.3657196583, maxx: -8237050.76692817, maxy: 3907260.274867002}, crs: 'EPSG:3857', rotation: 0},
            layers: [
                {type: 'osm', title: 'Open Street Map', name: 'mapnik', source: 'osm', group: 'background', visibility: true, id: 'mapnik__0'},
                {type: 'wms', featureInfo: null, url: 'https://gs-stable.geosolutionsgroup.com/geoserver/wms', visibility: true, dimensions: [], name: 'gs:us_states', title: 'States of US', description: '', bbox: {crs: 'EPSG:4326', bounds: {minx: -124.73142200000001, miny: 24.955967, maxx: -66.969849, maxy: 49.371735}}, links: [], params: {}, allowedSRS: {}, imageFormats: [], infoFormats: [], search: {type: 'wfs', url: 'https://gs-stable.geosolutionsgroup.com/geoserver/wfs'}, id: 'gs:us_states__3bb39980-9030-11ee-b036-b16bb8d06c94'}
            ],
            filter: undefined,
            quickFilters: {STATE_NAME: {rawValue: 'florida', value: 'florida', operator: 'ilike', type: 'string', attribute: 'STATE_NAME'}},
            layer: {type: 'wms', featureInfo: null, url: 'https://gs-stable.geosolutionsgroup.com/geoserver/wms', visibility: true, dimensions: [], name: 'gs:us_states', title: 'States of US', description: '', bbox: {crs: 'EPSG:4326', bounds: {minx: -124.73142200000001, miny: 24.955967, maxx: -66.969849, maxy: 49.371735}}, links: [], params: {}, allowedSRS: {}, imageFormats: [], infoFormats: [], search: {type: 'wfs', url: 'https://gs-stable.geosolutionsgroup.com/geoserver/wfs'}},
            options: {propertyName: [{name: 'STATE_NAME'}, {name: 'STATE_FIPS'}, {name: 'SUB_REGION'}, {name: 'STATE_ABBR'}, {name: 'LAND_KM'}, {name: 'WATER_KM'}, {name: 'PERSONS'}, {name: 'FAMILIES'}, {name: 'HOUSHOLD'}, {name: 'MALE'}, {name: 'FEMALE'}, {name: 'WORKERS'}, {name: 'DRVALONE'}, {name: 'CARPOOL'}, {name: 'PUBTRANS'}, {name: 'EMPLOYED'}, {name: 'UNEMPLOY'}, {name: 'SERVICE'}, {name: 'MANUAL'}, {name: 'P_MALE'}, {name: 'P_FEMALE'}, {name: 'SAMP_POP'}]},
            mapSync: true,
            dependenciesMap: undefined
        });
    });
});
