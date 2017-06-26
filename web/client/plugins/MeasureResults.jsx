const PropTypes = require('prop-types');
/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');

const Message = require('./locale/Message');

const {changeMeasurement} = require('../actions/measurement');

const {MeasureDialog} = require('./measure/index');

class MeasureComponent extends React.Component {
    static propTypes = {
        lineMeasureEnabled: PropTypes.bool,
        areaMeasureEnabled: PropTypes.bool,
        bearingMeasureEnabled: PropTypes.bool,
        toggleMeasure: PropTypes.func
    };

    onModalHiding = () => {
        const newMeasureState = {
            lineMeasureEnabled: false,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            geomType: null,
            // reset old measurements
            len: 0,
            area: 0,
            bearing: 0
        };
        this.props.toggleMeasure(newMeasureState);
    };

    render() {
        const labels = {
            lengthLabel: <Message msgId="measureComponent.lengthLabel"/>,
            areaLabel: <Message msgId="measureComponent.areaLabel"/>,
            bearingLabel: <Message msgId="measureComponent.bearingLabel"/>
        };
        return <MeasureDialog showButtons={false} onClose={this.onModalHiding} show={this.props.lineMeasureEnabled || this.props.areaMeasureEnabled || this.props.bearingMeasureEnabled} {...labels} {...this.props}/>;
    }
}

/**
 * MeasureResults plugin. Shows the measure results. This is an old version of measure tool that will be removed soon.
 * It should be used with the MeasurePanel plugin
 * @class
 * @name MeasureResults
 * @memberof plugins
 * @deprecated since version 2017.03.01
 */
const MeasureResultsPlugin = connect((state) => {
    return {
        measurement: state.measurement || {},
        lineMeasureEnabled: state.measurement && state.measurement.lineMeasureEnabled || false,
        areaMeasureEnabled: state.measurement && state.measurement.areaMeasureEnabled || false,
        bearingMeasureEnabled: state.measurement && state.measurement.bearingMeasureEnabled || false
    };
}, {
    toggleMeasure: changeMeasurement
})(MeasureComponent);

module.exports = {
    MeasureResultsPlugin,
    reducers: {measurement: require('../reducers/measurement')}
};
