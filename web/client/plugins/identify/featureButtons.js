
/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


/**
  * Buttons for Identify Tool Feature Toolbar
  */
module.exports = ({
    showHighlightFeatureButton,
    currentFeature,
    highlight,
    toggleHighlightFeature = () => {},
    zoomToFeature = () => {}
}) => [
    {
        glyph: 'map-filter',
        visible: showHighlightFeatureButton,
        tooltipId: highlight ? "identifyStopHighlightingFeatures" : "identifyHighlightFeatures",
        bsStyle: highlight ? "success" : "primary",
        onClick: () => toggleHighlightFeature(!highlight)
    }, {
        glyph: 'zoom-to',
        visible:
            highlight
            && !!currentFeature
            && currentFeature.length > 0
            // has at least 1 geometry
            && currentFeature.reduce((hasGeometries, { geometry } = {}) => hasGeometries || !!geometry, false) || false,
        tooltipId: "identifyZoomToFeature",
        onClick: zoomToFeature
    }
];
