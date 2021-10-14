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
});
