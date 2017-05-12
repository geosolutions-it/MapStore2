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
const {changeMeasurement} = require('../actions/measurement');
const {MeasureComponent} = require('./measure');

const selector = (state) => {
    return {
        measurement: state.measurement || {},
        lineMeasureEnabled: state.measurement && state.measurement.lineMeasureEnabled || false,
        areaMeasureEnabled: state.measurement && state.measurement.areaMeasureEnabled || false,
        bearingMeasureEnabled: state.measurement && state.measurement.bearingMeasureEnabled || false
    };
};
/**
 * MeasurePanel plugin. Shows the measure tool in the TOC. This is an old version of measure tool that will be removed soon.
 * @class
 * @name MeasurePanel
 * @memberof plugins
 * @deprecated since version 2017.03.01
 * @prop {boolean} showResults shows the measure in the panel itself. It can be disabled if you are using a plugin like MeasureResults to show the results
 */
const MeasurePanelPlugin = connect(selector, {
    toggleMeasure: changeMeasurement
}, null, {pure: false})(MeasureComponent);

module.exports = {
    MeasurePanelPlugin: assign(MeasurePanelPlugin, {
        Toolbar: {
            name: 'measurement',
            position: 9,
            panel: true,
            exclusive: true,
            wrap: true,
            help: <Message msgId="helptexts.measureComponent"/>,
            tooltip: "measureComponent.tooltip",
            icon: <Glyphicon glyph="1-ruler"/>,
            title: "measureComponent.title",
            priority: 1
        },
        DrawerMenu: {
            name: 'measurement',
            position: 3,
            glyph: "1-ruler",
            title: 'measureComponent.title',
            showPanel: false,
            buttonConfig: {
                buttonClassName: "square-button no-border",
                tooltip: "toc.measure"
            },
            priority: 2
        }
    }),
    reducers: {measurement: require('../reducers/measurement')}
};
