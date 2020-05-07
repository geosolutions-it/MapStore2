/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    BingLayer: require('./BingLayer').default,
    GoogleLayer: require('./GoogleLayer').default,
    GraticuleLayer: require('./GraticuleLayer').default,
    MapQuest: require('./MapQuest').default,
    OSMLayer: require('./OSMLayer').default,
    OverlayLayer: require('./OverlayLayer').default,
    TMSLayer: require('./TMSLayer').default,
    TileProviderLayer: require('./TileProviderLayer').default,
    VectorLayer: require('./VectorLayer').default,
    WFSLayer: require('./WFSLayer').default,
    WFS3Layer: require('./WFS3Layer').default,
    WMSLayer: require('./WMSLayer').default,
    WMTSLayer: require('./WMTSLayer').default
};
