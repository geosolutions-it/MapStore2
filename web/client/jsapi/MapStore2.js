/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const StandardApp = require('../components/app/StandardApp');
const LocaleUtils = require('../utils/LocaleUtils');
const {connect} = require('react-redux');

const {configureMap} = require('../actions/config');

const url = require('url');

const ThemeUtils = require('../utils/ThemeUtils');

require('./mapstore2.css');

const defaultConfig = {
    "map": {
        "projection": "EPSG:3857",
        "units": "m",
        "center": {"x": 1250000.000000, "y": 5370000.000000, "crs": "EPSG:900913"},
        "zoom": 5,
        "maxExtent": [
            -20037508.34, -20037508.34,
            20037508.34, 20037508.34
        ],
        "layers": [{
            "type": "osm",
            "title": "Open Street Map",
            "name": "mapnik",
            "source": "osm",
            "group": "background",
            "visibility": true
        },
          {
            "type": "tileprovider",
            "title": "NASAGIBS Night 2012",
            "provider": "NASAGIBS.ViirsEarthAtNight2012",
            "name": "Night2012",
            "source": "nasagibs",
            "group": "background",
            "visibility": false
          },
          {
                    "type": "wms",
            "url": "http://213.215.135.196/reflector/open/service",
            "visibility": false,
                    "title": "e-Geos Ortofoto RealVista 1.0",
                    "name": "rv1",
                    "group": "background",
                    "format": "image/png"
                },
          {
                    "type": "wms",
            "url": "http://demo.geo-solutions.it/geoserver/wms",
            "visibility": false,
                    "title": "Natural Earth",
                    "name": "sde:NE2_HR_LC_SR_W_DR",
                    "group": "background",
                    "format": "image/png"
                },
          {
                    "type": "wms",
            "url": "http://demo.geo-solutions.it/geoserver/wms",
            "visibility": false,
                    "title": "Hypsometric",
                    "name": "sde:HYP_HR_SR_OB_DR",
                    "group": "background",
                    "format": "image/png"
                },
                {
                    "type": "wms",
            "url": "http://demo.geo-solutions.it/geoserver/wms",
            "visibility": false,
                    "title": "Gray Earth",
                    "name": "sde:GRAY_HR_SR_OB_DR",
                    "group": "background",
                    "format": "image/png"
                },
          {
                    "type": "wms",
            "url": "http://demo.geo-solutions.it/geoserver/wms",
            "visibility": true,
            "opacity": 0.5,
                    "title": "Weather data",
                    "name": "nurc:Arc_Sample",
                    "group": "Meteo",
                    "format": "image/png"
                },
          {
            "type": "tileprovider",
            "title": "OpenTopoMap",
            "provider": "OpenTopoMap",
            "name": "OpenTopoMap",
            "source": "OpenTopoMap",
            "group": "background",
            "visibility": false
          }]
    }
};

const defaultPlugins = {
    "mobile": ["Map"],
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

function loadConfigFromStorage(name = 'mapstore.embedded') {
    if (name) {
        const loaded = localStorage.getItem(name);
        if (loaded) {
            return JSON.parse(loaded);
        }
    }
    return null;
}

function getMapNameFromRequest(paramName = 'map') {
    const urlQuery = url.parse(window.location.href, true).query;
    return urlQuery[paramName] || null;
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

const MapStore2 = {
    create(container, options) {
        const embedded = require('../containers/Embedded');

        const {initialState, storeOpts} = options;

        const pluginsDef = require('./plugins');
        const pages = [{
            name: "embedded",
            path: "/",
            component: embedded,
            pageConfig: {
                pluginsConfig: options.plugins || defaultPlugins
            }
        }];

        const StandardRouter = connect((state) => ({
            locale: state.locale || {},
            pages
        }))(require('../components/app/StandardRouter'));

        const appStore = require('../stores/StandardStore').bind(null, initialState || {}, {});
        const initialActions = options.initialState ? [] : [configureMap.bind(null, options.config || defaultConfig)];
        const appConfig = {
            storeOpts,
            appStore,
            pluginsDef,
            initialActions,
            appComponent: StandardRouter,
            printingEnabled: false
        };
        const className = options.className || 'ms2';
        if (options.style) {
            let dom = document.getElementById('custom_theme');
            if (!dom) {
                dom = document.createElement('style');
                dom.id = 'custom_theme';
                document.head.appendChild(dom);
            }
            ThemeUtils.renderFromLess(options.style, 'custom_theme', 'themes/default/');
        }
        ReactDOM.render(<StandardApp className={className + " fill"} {...appConfig}/>, document.getElementById(container));
    },
    buildPluginsCfg,
    getMapNameFromRequest,
    loadConfigFromStorage
};

if (!global.Intl ) {
    // Ensure Intl is loaded, then call the given callback
    LocaleUtils.ensureIntl();
}

module.exports = MapStore2;
