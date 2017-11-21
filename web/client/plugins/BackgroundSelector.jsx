/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');
const {toggleControl, setControlProperty} = require('../actions/controls');
const {changeLayerProperties} = require('../actions/layers');

const {createSelector} = require('reselect');
const {layersSelector, backgroundControlsSelector, currentBackgroundSelector, tempBackgroundSelector} = require('../selectors/layers');
const {mapTypeSelector} = require('../selectors/maptype');
const {invalidateUnsupportedLayer} = require('../utils/LayersUtils');
const {mapSelector} = require('../selectors/map');
const {mapLayoutValuesSelector} = require('../selectors/maplayout');

const drawerEnabledControlSelector = (state) => (state.controls && state.controls.drawer && state.controls.drawer.enabled) || false;

const HYBRID = require('./background/assets/img/HYBRID.jpg');
const ROADMAP = require('./background/assets/img/ROADMAP.jpg');
const TERRAIN = require('./background/assets/img/TERRAIN.jpg');
const SATELLITE = require('./background/assets/img/SATELLITE.jpg');
const Aerial = require('./background/assets/img/Aerial.jpg');
const mapnik = require('./background/assets/img/mapnik.jpg');
const mapquestOsm = require('./background/assets/img/mapquest-osm.jpg');
const empty = require('./background/assets/img/none.jpg');
const unknown = require('./background/assets/img/dafault.jpg');
const Night2012 = require('./background/assets/img/NASA_NIGHT.jpg');
const AerialWithLabels = require('./background/assets/img/AerialWithLabels.jpg');
const OpenTopoMap = require('./background/assets/img/OpenTopoMap.jpg');

const thumbs = {
    google: {
        HYBRID,
        ROADMAP,
        TERRAIN,
        SATELLITE
    },
    bing: {
        Aerial,
        AerialWithLabels
    },
    osm: {
        mapnik
    },
    mapquest: {
        osm: mapquestOsm
    },
    ol: {
        "undefined": empty
    },
    nasagibs: {
        Night2012
    },
    OpenTopoMap: {
        OpenTopoMap
    },
    unknown
};

const backgroundSelector = createSelector([
        mapSelector,
        layersSelector,
        backgroundControlsSelector,
        drawerEnabledControlSelector,
        mapTypeSelector,
        currentBackgroundSelector,
        tempBackgroundSelector,
        state => mapLayoutValuesSelector(state, {left: true, bottom: true})
    ],
    (map, layers, controls, drawer, maptype, currentLayer, tempLayer, style) => ({
        size: map && map.size || {width: 0, height: 0},
        layers: layers.filter((l) => l && l.group === "background").map((l) => invalidateUnsupportedLayer(l, maptype)) || [],
        tempLayer,
        currentLayer,
        start: controls.start || 0,
        enabled: controls.enabled,
        style
    }));

/**
  * BackgroundSelector Plugin.
  * @class BackgroundSelector
  * @memberof plugins
  * @static
  *
  * @prop {number} cfg.left plugin position from left of the map
  * @prop {number} cfg.bottom plugin position from bottom of the map
  * @prop {object} cfg.dimensions dimensions of buttons
  * @class
  * @example
  * {
  *   "name": "BackgroundSelector",
  *   "cfg": {
  *     "dimensions": {
  *       "side": 65,
  *       "sidePreview": 65,
  *       "frame": 3,
  *       "margin": 5,
  *       "label": false,
  *       "vertical": true
  *     }
  *   }
  * }
  */

const BackgroundSelectorPlugin = connect(backgroundSelector, {
    onPropertiesChange: changeLayerProperties,
    onToggle: toggleControl.bind(null, 'backgroundSelector', null),
    onLayerChange: setControlProperty.bind(null, 'backgroundSelector'),
    onStartChange: setControlProperty.bind(null, 'backgroundSelector', 'start')
}, (stateProps, dispatchProps, ownProps) => ({
        ...stateProps,
        ...dispatchProps,
        ...ownProps,
        thumbs: {
            ...thumbs,
            ...ownProps.thumbs
        }
    })
)(require('../components/background/BackgroundSelector'));

module.exports = {
    BackgroundSelectorPlugin,
    reducers: {
        controls: require('../reducers/controls')
    }
};
