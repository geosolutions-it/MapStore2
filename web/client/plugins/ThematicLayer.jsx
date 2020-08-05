/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const {connect} = require('../utils/PluginsUtils');
const assign = require('object-assign');

const { changeLayerParams } = require('../actions/layers');
const { loadFields, loadClassification, changeConfiguration, cancelDirty, setDirty,
    setInvalidInput, resetInvalidInput } = require('../actions/thematic');
const { getSelectedLayer } = require('../selectors/layers');

const API = require('../api/SLDService');

const { isAdminUserSelector } = require('../selectors/security');

/**
 * Plugin that adds thematic styles for wms layers, through attribute classification.
 *
 * Layers can be simple vector layers, or parametric (GeoServer) SQL views.
 *
 * GeoServer SLDService is used as the external classification service.
 *
 * @see {@link api/framework#components.TOC.ThematicLayer}
 *
 * @memberof plugins
 * @name ThematicLayer
 * @class
 * @prop {boolean} enableRemoveStyle enables the remove style button (disabled by default)
 * @prop {array} cfg.colors list of base color palettes the user can choose to create the style (they can be extended via
 *    layer configuration)
 * @prop {number} cfg.colorSamples number of samples to show in the color palette list
 * @prop {number} cfg.maxClasses number of classes (range + color) the user can choose for the style
 * @prop {object} cfg.initialParams object with initial/default values for the style parameters in the UI
 *
 * @example
 * // custom color palettes:
 * colors: [{
 *  "name": "mypalette",
 *  "colors": ["#ff0", "#0f0"] // you can specify as many colors (stop points) as you wish, other colors will be interpolated as needed
 * }, ...]
 *
 * @example
 * // A configuration object looks like this:
 * {
 *    "datatable": "...", // optional external data layer, can be used to retrieve the list of classification attributes (for SQL views),
 *    "attribute": "...", // name of the (fixed) classification attribute for SQLViews where the thema field is parametric (e.g. thema)
 *    "fieldAsParam": true/false, // if true the field is a parameter of the SQLView, if not is a real attribute of the layer
 *        when the field is parametric, you also have to specify attribute (the fixed attribute name in the SQLView and either
 *        datatable or fields to configure the list of available fields)
 *    "fields": [...], // optional list of classification fields (use this one or datatable to configure the list of fields)
 *    "colors": [...], // optional list of custom palettes (will override global ones)
 *    "additionalColors": [...] // optional list of additional color palettes (will be appended to the default ones),
 *    "params": [{ // parameters for SQL views (encoded as viewparams); do not specify the field here, but use fieldAsParam: truet
 *        "type": "aggregate", // type is used for pre-configured parameters, actually only aggregate is supported,
 *                             // for aggregation type selection through groupby (sum, count, min, ...)
 *        "name": "aggregate"
 *    }, ...]
 * }
 *
 * @example
 * // custom (filter) parameter can be configured like this:
 * {
 *      "title": "...", // label in the UI
        "field": "regione", // viewparam name
        "defaultValue": -1, // default (initial) value
        "values": [ // list of chosable values
            {
                "name": "All", // label
                "value": -1    // parameter value
            }, ...
        ]
 * }
 *
 * @example
 * // static list of fields:
 * "fields": [{
 *    "name": "...",
 *    "type": "number"
 * }, ...]
 */


module.exports = {
    ThematicLayerPlugin: assign({
        loadPlugin: (resolve)=> {
            require.ensure(['../components/TOC/fragments/settings/ThematicLayer'], () => {
                const ThematicLayer = connect((state) => {
                    const customColors = state.thematic && state.thematic.colors;
                    return assign({}, {
                        layer: getSelectedLayer(state),
                        fields: state && state.thematic && state.thematic.fields || [],
                        fieldsLoading: {
                            status: state && state.thematic && state.thematic.loadingFields || false,
                            error: state && state.thematic && state.thematic.errorFields || null
                        },
                        classification: state && state.thematic && state.thematic.classification || [],
                        classificationLoading: {
                            status: state && state.thematic && state.thematic.loadingClassification || false,
                            error: state && state.thematic && state.thematic.errorClassification || null
                        },
                        canEditThematic: isAdminUserSelector(state),
                        initialParams: assign(API.defaultParams, customColors ? {
                            ramp: customColors[0].name
                        } : {}),
                        methods: API.methods,
                        colors: customColors,
                        adminCfg: state && state.thematic && state.thematic.adminCfg,
                        applyEnabled: state && state.thematic && state.thematic.dirty || false,
                        invalidInputs: state && state.thematic && state.thematic.invalidInputs || {},
                        geometryType: state && state.thematic && state.thematic.classification
                            && state.thematic.classification.length && state.thematic.classification[0].type || 'Polygon'
                    }, API);
                }, {
                    onChangeConfiguration: changeConfiguration,
                    onChangeLayerParams: changeLayerParams,
                    onSwitchLayer: loadFields,
                    onClassify: loadClassification,
                    onApplyStyle: cancelDirty,
                    onDirtyStyle: setDirty,
                    onInvalidInput: setInvalidInput,
                    onValidInput: resetInvalidInput
                })(require('../components/TOC/fragments/settings/ThematicLayer'));
                resolve(ThematicLayer);
            });
        }, enabler: (state) => state.layerSettings && state.layerSettings.expanded
    }, {
        TOCItemsSettings: {
            priority: 1,
            name: 'ThematicLayer',
            selector: (props) => {
                return props?.element?.search;
            },
            container: "TOCItemSettings",
            target: "style"
        }
    }),
    reducers: {
        thematic: require('../reducers/thematic')
    },
    epics: require('../epics/thematic')(require('../api/SLDService'))
};
