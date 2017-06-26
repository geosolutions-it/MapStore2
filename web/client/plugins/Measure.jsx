/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {Glyphicon} = require('react-bootstrap');

const Message = require('./locale/Message');

const assign = require('object-assign');
const {createSelector} = require('reselect');
const {changeMeasurement} = require('../actions/measurement');
const {toggleControl} = require('../actions/controls');
const {MeasureDialog} = require('./measure/index');

const selector = (state) => {
    return {
        measurement: state.measurement || {},
        lineMeasureEnabled: state.measurement && state.measurement.lineMeasureEnabled || false,
        areaMeasureEnabled: state.measurement && state.measurement.areaMeasureEnabled || false,
        bearingMeasureEnabled: state.measurement && state.measurement.bearingMeasureEnabled || false
    };
};
const toggleMeasureTool = toggleControl.bind(null, 'measure', null);
/**
 * Measure plugin. Allows to show the tool to measure dinstances, areas and bearing.
 * @class
 * @name Measure
 * @memberof plugins
 * @prop {boolean} showResults shows the measure in the panel itself.
 */
const Measure = connect(
    createSelector([
        selector,
        (state) => state && state.controls && state.controls.measure && state.controls.measure.enabled
    ],
        (measure, show) => ({
            show,
            ...measure
        }
    )),
    {
        toggleMeasure: changeMeasurement,
        onClose: toggleMeasureTool
    }, null, {pure: false})(MeasureDialog);

module.exports = {
    MeasurePlugin: assign(Measure, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'measurement',
            position: 9,
            panel: false,
            help: <Message msgId="helptexts.measureComponent"/>,
            tooltip: "measureComponent.tooltip",
            text: <Message msgId="measureComponent.Measure"/>,
            icon: <Glyphicon glyph="1-ruler"/>,
            action: toggleMeasureTool
        }
    }),
    reducers: {measurement: require('../reducers/measurement')}
};
