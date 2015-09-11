/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Proj4js = require('proj4');
var React = require('react');

var url = require('url');

var axios = require('axios');

const epsg4326 = Proj4js ? new Proj4js.Proj('EPSG:4326') : null;
const centerPropType = React.PropTypes.shape({
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
    crs: React.PropTypes.string
});

const urlQuery = url.parse(window.location.href, true).query;
let defaultConfig = {
    proxyUrl: "/mapstore/proxy/?url=",
    geoStoreUrl: "/mapstore/rest/geostore/"
};

var ConfigUtils = {
    defaultSourceType: "gxp_wmssource",
    backgroundGroup: "background",

    PropTypes: {
        center: centerPropType,
        config: React.PropTypes.shape({
            center: centerPropType,
            zoom: React.PropTypes.number.isRequired
        })
    },

    loadConfiguration: function() {
        return axios.get('localConfig.json').then(response => {
            defaultConfig = response.data;
        });
    },

    getCenter: function(center, projection) {
        var retval;
        if (center.x && center.y && center.crs) {
            if (center.crs !== "EPSG:4326") {
                let xy = Proj4js.toPoint([center.x, center.y]);
                const epsgMap = new Proj4js.Proj(center.crs);
                Proj4js.transform(epsgMap, epsg4326, xy);
                retval = {y: xy.y, x: xy.x, crs: "EPSG:4326"};
            } else {
                retval = center;
            }
            return retval;
        }
        let xy = Proj4js.toPoint(center);
        if (projection) {
            const epsgMap = new Proj4js.Proj(projection);
            Proj4js.transform(epsgMap, epsg4326, xy);
        }
        return {y: xy.y, x: xy.x, crs: "EPSG:4326"};
    },
    normalizeConfig: function(config) {
        config.center = ConfigUtils.getCenter(config.center);
        return config;
    },
    getUserConfiguration: function(defaultName, extension, geoStoreBase) {
        return ConfigUtils.getConfigurationOptions(urlQuery, defaultName, extension, geoStoreBase);
    },
    getConfigurationOptions: function(query, defaultName, extension, geoStoreBase) {
        const mapId = query.mapId;
        let configUrl;
        if (mapId) {
            configUrl = ( geoStoreBase || defaultConfig.geoStoreUrl ) + "data/" + mapId;
        } else {
            configUrl = (query.config || defaultName || 'config') + '.' + (extension || 'json');
        }
        return {
            configUrl: configUrl,
            legacy: !!mapId
        };
    },

    convertFromLegacy: function(config) {
        var mapConfig = config.map;
        var sources = config.gsSources || config.sources;
        var layers = mapConfig.layers;
        var latLng = ConfigUtils.getCenter(mapConfig.center, mapConfig.projection);
        var zoom = mapConfig.zoom;
        var maxExtent = mapConfig.maxExtent;

        // setup layers and sources with defaults
        this.setupSources(sources, config.defaultSourceType);
        this.setupLayers(layers, sources, ["gxp_osmsource", "gxp_wmssource", "gxp_googlesource", "gxp_bingsource"]);
        return {
            center: latLng,
            zoom: zoom,
            maxExtent: maxExtent, // TODO convert maxExtent
            layers: layers,
            projection: mapConfig.projection || 'EPSG:3857'
        };
    },

    /**
     * set default wms source
     */
    setupSources: function(sources, defaultSourceType) {
        var defType = defaultSourceType;
        var source;
        if (!defaultSourceType) {
            defType = this.defaultSourceType;
        }
        for (source in sources) {
            if (sources.hasOwnProperty(source)) {
                if (!sources[source].ptype) {
                    sources[source].ptype = defType;
                }
            }
        }
    },
    /**
     * Copy important source options to layer options.
     */
    copySourceOptions: function(layer, source) {
        Object.keys(source).forEach((option) => {
            if (['url', 'baseParams'].indexOf(option) !== -1) {
                layer[option] = source[option];
            }
        });
    },

    /**
     * Setup the layer visibility for the background group.
     * if background layers are not visible, sets the last one
     */
    setupLayers: function(layers, sources, supportedSourceTypes) {
        // setup background visibility
        var candidateVisible;
        var i; var layer; var source;
        for (i = 0; i < layers.length; i++) {
            layer = layers[i];
            source = sources[layer.source];
            ConfigUtils.copySourceOptions(layer, source);
            let type = source.ptype;
            if (type) {
                layer.type = type.replace(/^gxp_(.*)source$/i, "$1");
            } else {
                layer.type = 'unknown';
            }
            if (layer) {
                if (supportedSourceTypes.indexOf(source.ptype) >= 0) {
                    if (layer.group === this.backgroundGroup) {
                        // force to false if undefined
                        layer.visibility = layer.visibility || false;
                        if (candidateVisible && candidateVisible.visibility) {
                            /* if more than one layer is visible in the background group
                               shows only the last one hiding the previous.
                            */
                            if (layer.visibility) {
                                candidateVisible.visibility = false;
                                candidateVisible = layer;
                            }
                        } else {
                            candidateVisible = layer;
                        }
                    }
                } else {
                    layer.visibility = false;
                }
            }
        }
        // set the candidate visible
        if (candidateVisible) {
            candidateVisible.visibility = true;
        }
    },
    /**
     * Utility to merge different configs
     */
    mergeConfigs: function(baseConfig, mapConfig) {
        baseConfig.map = mapConfig.map;
        baseConfig.gsSources = mapConfig.gsSources || mapConfig.sources;
        return baseConfig;
    },
    getProxyUrl: function(config) {
        return config.proxyUrl ? config.proxyUrl : defaultConfig.proxyUrl;
    }
};

module.exports = ConfigUtils;
