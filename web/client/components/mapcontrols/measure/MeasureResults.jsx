/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Panel} = require('react-bootstrap');
const Draggable = require('react-draggable');

const Message = require('../../../plugins/locale/Message');
const ReactIntl = require('react-intl');
const FormattedNumber = ReactIntl.FormattedNumber;
const measureUtils = require('../../../utils/MeasureUtils');

const {isEqual} = require('lodash');

const MeasureResults = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        name: React.PropTypes.string,
        columnProperties: React.PropTypes.object,
        propertiesChangeHandler: React.PropTypes.func,
        lengthLabel: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        areaLabel: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        bearingLabel: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        uom: React.PropTypes.shape({
                    length: React.PropTypes.shape({ unit: React.PropTypes.string.isRequired,
                              label: React.PropTypes.string.isRequired}),
                    area: React.PropTypes.shape({ unit: React.PropTypes.string.isRequired,
                            label: React.PropTypes.string.isRequired})
                        }),
        toggleMeasure: React.PropTypes.func,
        measurement: React.PropTypes.object,
        lineMeasureEnabled: React.PropTypes.bool,
        areaMeasureEnabled: React.PropTypes.bool,
        bearingMeasureEnabled: React.PropTypes.bool,
        separatePanel: React.PropTypes.bool,
        title: React.PropTypes.object,
        panelStyle: React.PropTypes.object,
        panelClassName: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            columnProperties: {
                xs: 4,
                sm: 4,
                md: 4
            },
            id: "measure-result-panel",
            uom: {
                length: {unit: 'm', label: 'm'},
                area: {unit: 'sqm', label: 'm²'}
            },
            separatePanel: true,
            title: <Message msgId="measureComponent.title"/>,
            panelStyle: {
                minWidth: "300px",
                left: "52px",
                zIndex: 100,
                position: "absolute",
                overflow: "auto"
            },
            panelClassName: "drawer-menu-panel"
        };
    },
    shouldComponentUpdate(nextProps) {
        return !isEqual(nextProps, this.props);
    },
    onModalHiding() {
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
    },
    renderHeader() {
        return (
            <span>
                <Message msgId="measureComponent.title" />
                <button onClick={this.onModalHiding} className="close"><span>×</span></button>
            </span>
        );
    },
    render() {
        if (this.props.lineMeasureEnabled || this.props.areaMeasureEnabled || this.props.bearingMeasureEnabled ) {
            let decimalFormat = {style: "decimal", minimumIntegerDigits: 1, maximumFractionDigits: 2, minimumFractionDigits: 2};
            return (
                <Draggable key={"drawer-menu--item-collapse-measures"}>
                    <Panel header={this.renderHeader()} style={this.props.panelStyle} className={this.props.panelClassName}>
                        <div className="panel-body">
                            <p><span>{this.props.lengthLabel}: </span><span id="measure-len-res"><FormattedNumber key="len" {...decimalFormat} value={measureUtils.getFormattedLength(this.props.uom.length.unit, this.props.measurement.len)} /> {this.props.uom.length.label}</span></p>
                            <p><span>{this.props.areaLabel}: </span><span id="measure-area-res"><FormattedNumber key="area" {...decimalFormat} value={measureUtils.getFormattedArea(this.props.uom.area.unit, this.props.measurement.area)} /> {this.props.uom.area.label}</span></p>
                            <p><span>{this.props.bearingLabel}: </span><span id="measure-bearing-res">{measureUtils.getFormattedBearingValue(this.props.measurement.bearing)}</span></p>
                        </div>
                    </Panel>
                </Draggable>
            );
        }
        return null;
    }
});

module.exports = MeasureResults;
