/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect, createPlugin } from '../utils/PluginsUtils';
import './map/css/map.css';
import { errorLoadingFont, setMapResolutions } from '../actions/map';
import selector from './map/selector';
import mapReducer from "../reducers/map";
import layersReducer from "../reducers/layers";
import drawReducer from "../reducers/draw";
import highlightReducer from "../reducers/highlight";
import mapTypeReducer from "../reducers/maptype";
import additionalLayersReducer from "../reducers/additionallayers";
import mapEpics from "../epics/map";
import {initComponents} from "./map/index";

import Map from "../components/map/Map";

/**
 * The Map plugin allows adding mapping library dependent functionality using support tools.
 * Some are already available for the supported mapping libraries (openlayers, leaflet, cesium), but it's possible to develop new ones.
 * An example is the MeasurementSupport tool that allows implementing measurement on a map.
 * The list of enabled tools can be configured using the tools property, as in the following example:
 *
 * ```
 * {
 * "name": "Map",
 * "cfg": {
 *     "tools": ["measurement", "locate", "overview", "scalebar", "draw", "highlight"]
 *   ...
 *  }
 * }
 * ```
 * // Each tool can be configured using the toolsOptions. Tool configuration can be mapping library dependent:
 * ```
 * "toolsOptions": {
 *        "scalebar": {
 *            "leaflet": {
 *                "position": "bottomright"
 *            }
 *            ...
 *        }
 *        ...
 *    }
 *
 * ```
 * or not
 * ```
 * "toolsOptions": {
 * "scalebar": {
 *        "position": "bottomright"
 *        ...
 *    }
 *    ...
 * }
 * ```
 * In addition to standard tools, you can also develop your own, ad configure them to be used.
 *
 * To do that you need to:
 *  - develop a tool Component, in JSX (e.g. TestSupport), for each supported mapping library
 * ```
 * const React = require('react');
 *    class TestSupport extends React.Component {
 *     static propTypes = {
 *            label: PropTypes.string
 *        }
 *        render() {
 *            alert(this.props.label);
 *            return null;
 *        }
 *    }
 *    module.exports = TestSupport;
 * ```
 *  - include the tool(s) in the requires section of plugins.js amd give it a name:
 * ```
 *    module.exports = {
 *        plugins: {
 *            MapPlugin: require('../plugins/Map'),
 *            ...
 *        },
 *        requires: {
 *            ...
 *            TestSupportLeaflet: require('../components/map/leaflet/TestSupport')
 *        }
 *    };
 * ```
 *  - configure the Map plugin including the new tool and related options. You can configure the tool to be used for each mapping library, giving it a name and impl attributes, where:
 * ```
 *    {
 *      "name": "Map",
 *      "cfg": {
 *        "shouldLoadFont": true,
 *        "fonts": ['FontAwesome'],
 *        "tools": ["measurement", "locate", "overview", "scalebar", "draw", {
 *          "leaflet": {
 *            "name": "test",
 *            "impl": "{context.TestSupportLeaflet}"
 *          }
 *          }],
 *        "toolsOptions": {
 *          "test": {
 *            "label": "Hello"
 *          }
 *          ...
 *        }
 *      }
 *    }
 * ```
 *  - name is a unique name for the tool
 *  - impl is a placeholder (“{context.ToolName}”) where ToolName is the name you gave the tool in plugins.js (TestSupportLeaflet in our example)
 *
 * You can also specify a list of fonts that have to be loaded before map rendering
 * if the shouldLoadFont is true
 * This font pre-load list is required if you're using canvas based mapping libraries (e.g. OpenLayers) and you need to show markers with symbols (e.g. Annotations).
 * For each font you must specify the font name used in the `@font-face` inside the "fonts" array property. Note: the `@font-face` declaration must be present in css of the page, otherwise the font can not be loaded anyway.
 * ```
 * {
 *    "name": "Map",
 *    "cfg": {
 *      "shouldLoadFont": true,
 *      "fonts": ['FontAwesome']
 *    }
 *  }
 * ```
 * For more info on metadata visit [fontfaceobserver](https://github.com/bramstein/fontfaceobserver)
 *
 * An additional feature to is limit the area and/or the minimum level of zoom in the localConfig.json file using "mapConstraints" property
 *
 *  e.g
 * ```json
 * "mapConstraints": {
 *  "minZoom": 12, // minimal allowed zoom used by default
 *  "crs":"EPSG:3857", // crs of the restrictedExtent
 *  "restrictedExtent":[ // limits the area accessible to the user to this bounding box
 *    1060334.456371965,5228292.734706056,
 *    1392988.403469052,5503466.036532691
 *   ],
 *   "projectionsConstraints": {
 *       "EPSG:1234": { "minZoom": 5 } // customization of minZoom for different projections
 *   }
 *  }
 * ```
 *
 * With this setup you can configure a restricted area and/or a minimum zoom level for the whole application.
 * If you have different reference systems for your maps, for each of them you can even set a minimum zoom
 * using the entry `projectionsConstraints` as written in the example.
 *
 * ```
 *
 * @memberof plugins
 * @class Map
 * @prop {array} additionalLayers static layers available in addition to those loaded from the configuration
 * @static
 * @example
 * // Adding a layer to be used as a source for the elevation (shown in the MousePosition plugin configured with showElevation = true)
 * {
 *   "cfg": {
 *     "additionalLayers": [{
 *         "type": "wms",
 *         "url": "http://localhost:8090/geoserver/wms",
 *         "visibility": true,
 *         "title": "Elevation",
 *         "name": "topp:elevation",
 *         "format": "application/bil16",
 *         "useForElevation": true,
 *         "nodata": -9999,
 *         "hidden": true
 *      }]
 *   }
 * }
 *
 */

const MapPlugin = (props) => {
    return <Map {...props} initMapComponents={initComponents}/>;
};

export default createPlugin('Map', {
    component: connect(selector, {
        onFontError: errorLoadingFont,
        onResolutionsChange: setMapResolutions
    })(MapPlugin),
    reducers: {
        map: mapReducer,
        layers: layersReducer,
        draw: drawReducer,
        highlight: highlightReducer,
        maptype: mapTypeReducer,
        additionallayers: additionalLayersReducer
    },
    epics: mapEpics
});

