/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    BingLayer: require('./BingLayer'),
    Commons: require('./Commons'),
    GraticuleLayer: require('./GraticuleLayer'),
    GoogleLayer: require('./GoogleLayer'),
    MapQuest: require('./MapQuest'),
    OSMLayer: require('./OSMLayer'),
    TMSLayer: require('./TMSLayer'),
    TileProviderLayer: require('./TileProviderLayer'),
    WFSLayer: require('./WFSLayer').default,
    WMSLayer: require('./WMSLayer'),
    WMTSLayer: require('./WMTSLayer'),
    VectorLayer: require('./VectorLayer')
};
