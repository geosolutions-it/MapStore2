/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const Measure = require('../../components/mapcontrols/measure/MeasureComponent');
const Message = require('../Message');


const MeasureComponent = React.createClass({
    render() {
        const labels = {
            lengthButtonText: <Message msgId="measureComponent.lengthButtonText"/>,
            areaButtonText: <Message msgId="measureComponent.areaButtonText"/>,
            resetButtonText: <Message msgId="measureComponent.resetButtonText"/>,
            lengthLabel: <Message msgId="measureComponent.lengthLabel"/>,
            areaLabel: <Message msgId="measureComponent.areaLabel"/>,
            bearingLabel: <Message msgId="measureComponent.bearingLabel"/>
        };
        return <Measure {...labels} {...this.props}/>;
    }
});

module.exports = MeasureComponent;
