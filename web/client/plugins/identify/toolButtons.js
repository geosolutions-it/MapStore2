
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


/**
  * Buttons for Identify Tool Toolbar
  */
module.exports = ({
    showHighlightFeatureButton,
    currentFeature,
    highlight,
    onEdit = () => {},
    ...props
}) => [
    {
        glyph: 'info-sign',
        tooltipId: 'identifyRevGeocodeSubmitText',
        visible: props.latlng && props.enableRevGeocode && props.lngCorrected && props.showMoreInfo,
        onClick: () => {
            props.showRevGeocode({lat: props.latlng.lat, lng: props.lngCorrected});
        }
    },
    {
        glyph: 'search-coords',
        tooltipId: props.showCoordinateEditor ? 'identifyHideCoordinateEditor' : 'identifyShowCoordinateEditor',
        visible: props.enabledCoordEditorButton,
        bsStyle: (props.showCoordinateEditor) ? "success" : "primary",
        onClick: () => {
            props.onToggleShowCoordinateEditor(props.showCoordinateEditor);
        }
    }, {
        glyph: 'pencil',
        visible: props.showEdit,
        tooltipId: "identifyEdit",
        onClick: () => onEdit()
    }
].filter(btn => btn && btn.visible);
