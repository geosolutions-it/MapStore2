/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import 'react-widgets/lib/less/react-widgets.less';

import PropTypes from 'prop-types';
import React from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import { Combobox, NumberPicker } from 'react-widgets';
import numberLocalizer from 'react-widgets/lib/localizers/simple-number';

import { getMessageById } from '../../utils/LocaleUtils';
import Message from '../I18N/Message';

numberLocalizer();


class BandSelector extends React.Component {
    static propTypes = {
        band: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        bands: PropTypes.array,
        min: PropTypes.number,
        max: PropTypes.number,
        contrast: PropTypes.oneOf(['none', 'Normalize', 'Histogram', 'GammaValue']),
        algorithm: PropTypes.oneOf(['none', 'StretchToMinimumMaximum', 'ClipToMinimumMaximum', 'ClipToZero']),
        gammaValue: PropTypes.number,
        onChange: PropTypes.func,
        bandsComboOptions: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        band: '1',
        contrast: "none",
        algorithm: "none",
        gammaValue: 1,
        min: 0,
        max: 255,
        bandsComboOptions: {},
        onChange: () => {},
        bands: ['1', '2', '3']
    };

    render() {
        return (
            <Grid fluid>
                <Row>
                    <Col xs={4}><label><Message msgId="bandselector.band"/></label> </Col>
                    <Col xs={4}><label><Message msgId="bandselector.enhancement"/></label></Col>
                    {this.props.contrast === "GammaValue" ? <Col xs={4}> <label><Message msgId="bandselector.value"/></label> </Col> : null }
                    {this.props.contrast === "Normalize" ? <Col xs={4}><label><Message msgId="bandselector.algorithmTitle"/></label></Col> : null }
                </Row>
                <Row>
                    <Col xs={4}>
                        <Combobox
                            data={this.props.bands}
                            value={this.props.band}
                            onChange={(v) => this.props.onChange("band", v)}
                            {...this.props.bandsComboOptions}/>
                    </Col>
                    <Col xs={4}>
                        <Combobox data={[
                            {value: "none", name: getMessageById(this.context.messages, "bandselector.enha.none")},
                            {value: 'Normalize', name: getMessageById(this.context.messages, "bandselector.enha.Normalize")},
                            {value: 'Histogram', name: getMessageById(this.context.messages, "bandselector.enha.Histogram")},
                            {value: 'GammaValue', 'name': getMessageById(this.context.messages, "bandselector.enha.GammaValue")}]}
                        valueField="value"
                        textField="name"
                        value={this.props.contrast}
                        onChange={(v) => this.props.onChange("contrast", v.value)}/>
                    </Col>
                    { this.props.contrast === "GammaValue" ? <Col xs={4}>
                        <NumberPicker
                            format="-#,###.##"
                            precision={3}
                            step={0.1}
                            min={0}
                            value={this.props.gammaValue}
                            onChange={(v) => this.props.onChange("gammaValue", v)}/></Col> : null}
                    { this.props.contrast === "Normalize" ?
                        <Col xs={4}>
                            <Combobox data={[
                                {value: "none", name: getMessageById(this.context.messages, "bandselector.algorithm.none")},
                                {value: 'StretchToMinimumMaximum', name: getMessageById(this.context.messages, "bandselector.algorithm.StretchToMinimumMaximum")},
                                {value: 'ClipToMinimumMaximum', name: getMessageById(this.context.messages, "bandselector.algorithm.ClipToMinimumMaximum")},
                                {value: 'ClipToZero', 'name': getMessageById(this.context.messages, "bandselector.algorithm.ClipToZero")}]}
                            valueField="value"
                            textField="name"
                            value={this.props.algorithm}
                            onChange={(v) => this.props.onChange("algorithm", v.value)}/>
                        </Col>
                        : null}
                </Row>
                {this.props.contrast === "Normalize" && this.props.algorithm !== "none" ?
                    <Row>
                        <Col xsOffset={2} xs={4}><label><Message msgId="bandselector.min"/></label></Col>
                        <Col xs={4}><label><Message msgId="bandselector.max"/></label></Col>
                    </Row> : null }
                {this.props.contrast === "Normalize" && this.props.algorithm !== "none" ?
                    <Row>
                        <Col xsOffset={2} xs={4}>
                            <NumberPicker
                                format="-#,###.##"
                                precision={3}
                                max={this.props.max - 1}
                                value={this.props.min}
                                onChange={(v) => this.props.onChange("min", v)}
                            /></Col>
                        <Col xs={4}>
                            <NumberPicker
                                format="-#,###.##"
                                precision={3}
                                min={this.props.min + 1}
                                value={this.props.max}
                                onChange={(v) => this.props.onChange("max", v)}
                            /></Col>
                    </Row> : null }
            </Grid>);
    }
}

export default BandSelector;
