/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const MarkerUtils = require('../../../utils/MarkerUtils');

const defaultIcon = MarkerUtils.markers.extra.icons[0];
const defaultMarkers = MarkerUtils.markers.extra.getGrid();
const glyphPrefix = 'fa';

/**
 * Annotations configuration object.
 * Stores overridable configuration.
 *
 * The default configuration is the following:
 *  - 2 fields (title and description)
 *  - extra markers library {@link https://github.com/coryasilva/Leaflet.ExtraMarkers}
 *  - font awesome glyphs for markers
 *  - multiGeometry enabled
 *
 * To (partially) override the configuration use initialState in localConfig.json:
 * @example
 * Only overrides the list of fields
 * {
 *   ...
 *   "initialState": {
 *     "defaultState": {
 *         "annotations": {
 *             "config": {
 *                 "fields": [{
 *                     "name": "myattribute",
 *                     "editable": true
 *                     "validator": "value.indexOf('fake') === -1",
 *                     "validateError": "annotations.error.fake"
 *                 }]
 *             }
 *         }
 *     }
 *   }
 * }
 *
 * @memberof components.mapControls.annotations
 * @class AnnotationsConfig
 */
module.exports = {
    /**
     * Available annotation fields.
     * A list of object specifying:
     *  - name: the field synthetic name
     *  - type: type of value for the field (text or html)
     *  - validator: (optional) rule for validation
     *  - validationError: (optional) id for the translations file containing the validation error message
     *  - showLabel: whether to show or not the label of the field in the viewer / editor
     *  - editable: whether the field can be edited or not in editing mode
     */
    fields: [
        {
            name: 'title',
            type: 'text',
            validator: (val) => val,
            validateError: 'annotations.mandatory',
            showLabel: true,
            editable: true
        },
        {
            name: 'description',
            type: 'html',
            showLabel: true,
            editable: true
        }
    ],
    /**
     * Grid of markers used to style annotations.
     */
    markers: defaultMarkers,
    /**
     * Markers icon sprite resource.
     */
    markerIcon: defaultIcon,
    /**
     * Markers used to style annotations configuration object.
     */
    markersConfig: MarkerUtils.markers.extra,
    /**
     * Allow multiGeometry or not (MultiPoint on a single annotation).
     */
    multiGeometry: false,
    /**
     * Available glyphs list (used by the markers styler).
     */
    glyphs: Object.keys(MarkerUtils.getGlyphs('fontawesome')),
    /**
     * Returns a CSS classname usable to draw a glyph for the given style (iconGlyph),
     * using the default glyphs library (font-awesome).
     * @param {string} style style object
     * @return {string} classname to draw the glyph
     */
    getGlyphClassName: (style) => {
        return glyphPrefix + " " + glyphPrefix + "-" + style.iconGlyph;
    },
    /**
     * Returns a marker configuration object for the given style, using the default (extra)
     * markers library.
     *
     * @param {string} style style object
     * @return {object} marker config object
     */
    getMarkerFromStyle: (style) => {
        return defaultMarkers.filter(m => m.name === style.iconShape)[0]
            .markers.filter(m2 => m2.name === style.iconColor)[0];
    }
};
