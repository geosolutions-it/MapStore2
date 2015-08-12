/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Proj4js = require('proj4');

var ConfigUtils = {
    defaultSourceType: "gxp_wmssource",
    backgroundGroup: "background",
    convertFromLegacy: function(config) {
        var mapConfig = config.map;
        var sources = config.gsSources;
        var layers = mapConfig.layers;
        var center = mapConfig.center;
        var zoom = mapConfig.zoom;
        var maxExtent = mapConfig.maxExtent;
        var projection = mapConfig.projection;

        // manage projection conversions
        var epsgMap = new Proj4js.Proj(projection);
        var epsg4326 = new Proj4js.Proj('EPSG:4326');
        var xy = new Proj4js.Point(center);
        Proj4js.transform(epsgMap, epsg4326, xy);
        const latLng = {lat: xy.y, lng: xy.x};

        // setup layers and sources with defaults
        this.setupSources(sources, config.defaultSourceType);
        this.setupLayers(layers, sources, ["gxp_osmsource", "gxp_wmssource"]);
        return {
            latLng: latLng,
            zoom: zoom,
            maxExtent: maxExtent, // TODO convert maxExtent
            layers: layers,
            sources: sources
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
                        }else {
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
    }
};

module.exports = ConfigUtils;
