/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const React = require('react');
const {Grid, Row, Col, Button} = require('react-bootstrap');

const Combobox = require('react-widgets').Combobox;
const numberLocalizer = require('react-widgets/lib/localizers/simple-number');
numberLocalizer();
const {NumberPicker} = require('react-widgets');

const ColorRampItem = require('./EqualIntervalComponents/ColorRampItem');
const colorsSchema = require("./EqualIntervalComponents/ColorRamp");
const colors = require("colorbrewer");

const Message = require('../I18N/Message');

const EqualInterval = React.createClass({
    propTypes: {
        min: React.PropTypes.number,
        max: React.PropTypes.number,
        classes: React.PropTypes.number,
        onChange: React.PropTypes.func,
        onClassify: React.PropTypes.func,
        ramp: React.PropTypes.string
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            min: 0,
            max: 100,
            classes: 5,
            ramp: "Blues",
            onChange: () => {},
            onClassify: () => {}
        };
    },
    shouldComponentUpdate() {
        return true;
    },
    getColorsSchema() {
        return (this.props.classes) ?
            colorsSchema.filter((c) => {
                return c.max >= this.props.classes;
            }, this) : colorsSchema;
    },
    getRampValue() {
        let ramp = this.props.ramp;
        if (!colors[this.props.ramp][this.props.classes]) {
            ramp = colorsSchema.filter((color) => { return color.max >= this.props.classes; }, this)[0].name;
        }
        return ramp;
    },
    render() {
        return (
            <Grid fluid>
                <Row>
                    <Col xs={4}>
                        <Row><Col xs={12} >
                            <label><Message msgId="equalinterval.min"/></label>
                        </Col></Row>
                        <Row><Col xs={12} >
                            <NumberPicker
                                onChange={(number) => this.props.onChange("min", number)}
                                value={this.props.min}
                                format="-#,###.##"
                                precision={3}
                            />
                        </Col></Row>
                    </Col>
                    <Col xs={4}>
                        <Row><Col xs={12} >
                            <label><Message msgId="equalinterval.max"/></label>
                        </Col></Row>
                        <Row><Col xs={12} >
                            <NumberPicker
                                min={this.props.min + 1}
                                onChange={(number) => this.props.onChange("max", number)}
                                value={this.props.max}
                                format="-#,###.##"
                                precision={3}
                            />
                         </Col></Row>
                    </Col>
                    <Col xs={4}>
                        <Row>
                            <Col xs={12} >
                                <label><Message msgId="equalinterval.classes"/></label>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} >
                                <NumberPicker
                                    onChange={(number) => this.props.onChange("classes", number)}
                                    precision={0} min={3} max={12} step={1}
                                    value={this.props.classes}
                                />
                            </Col>
                        </Row>
                    </Col>
                    </Row>
                    <Row>
                    <Col xs={6} >
                        <Row><Col xs={12} >
                            <label><Message msgId="equalinterval.ramp"/></label>
                        </Col></Row>
                        <Row><Col xs={12} >
                            <Combobox data={this.getColorsSchema()}
                                groupBy="schema"
                                onChange={(value) => this.props.onChange("ramp", value.name)}
                                textField="name"
                                itemComponent={ColorRampItem} value={this.getRampValue()}/>
                        </Col></Row>
                    </Col>
                    <Col xs={6}>
                        <Row style={{paddingTop: "25px"}}>
                        <Col xs={12} >
                        <Button onClick={this.generateEqualIntervalRamp} style={{"float": "right"}}>
                        <Message msgId="equalinterval.classify"/></Button>
                        </Col></Row>
                    </Col>
                </Row>
            </Grid>);
    },
    generateEqualIntervalRamp() {
        let ramp = colors[this.props.ramp][this.props.classes];
        let min = this.props.min;
        let max = this.props.max;
        let step = (max - min) / this.props.classes;
        let colorRamp = ramp.map((color, idx) => {
            return {color: color, quantity: min + (idx * step)};
        });
        this.props.onClassify("colorRamp", colorRamp);
    }
});

module.exports = EqualInterval;
