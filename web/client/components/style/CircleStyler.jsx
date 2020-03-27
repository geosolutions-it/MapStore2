/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const assign = require('object-assign');
const {Grid, Row, Col} = require('react-bootstrap');
const ColorSelector = require('./ColorSelector').default;
const StyleCanvas = require('./StyleCanvas');
const Slider = require('react-nouislider');
const numberLocalizer = require('react-widgets/lib/localizers/simple-number');
numberLocalizer();
require('react-widgets/lib/less/react-widgets.less');
const {isNil} = require('lodash');
const Message = require('../I18N/Message');
const tinycolor = require("tinycolor2");

class StylePolygon extends React.Component {
    static propTypes = {
        shapeStyle: PropTypes.object,
        width: PropTypes.number,
        setStyleParameter: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        shapeStyle: {},
        setStyleParameter: () => {}
    };

    render() {
        const styleType = "Circle";
        const style = this.props.shapeStyle[styleType] || this.props.shapeStyle; // in case of old version of style.
        return (<Grid fluid style={{ width: '100%' }} className="ms-style">
            <Row>
                <Col xs={12}>
                    <div className="ms-marker-preview" style={{display: 'flex', width: '100%', height: 104}}>
                        <StyleCanvas style={{ padding: 0, margin: "auto", display: "block"}}
                            shapeStyle={assign({}, style, {
                                color: this.addOpacityToColor(tinycolor(style.color).toRgb(), style.opacity),
                                fill: this.addOpacityToColor(tinycolor(style.fillColor).toRgb(), style.fillOpacity)
                            })}
                            geomType="Point"
                        />
                    </div>
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Message msgId="draw.fill"/>
                </Col>
                <Col xs={6} style={{position: 'static'}}>
                    <ColorSelector key="poly-fill" color={this.addOpacityToColor(tinycolor(style.fillColor).toRgb(), style.fillOpacity)} width={this.props.width} onChangeColor={c => {
                        if (!isNil(c)) {
                            const fillColor = tinycolor(c).toHexString();
                            const fillOpacity = c.a;
                            const newStyle = assign({}, this.props.shapeStyle, {
                                [styleType]: assign({}, style, {fillColor, fillOpacity})
                            });
                            this.props.setStyleParameter(newStyle);
                        }
                    }}/>
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Message msgId="draw.stroke"/>
                </Col>
                <Col xs={6} style={{position: 'static'}}>
                    <ColorSelector color={this.addOpacityToColor(tinycolor(style.color).toRgb(), style.opacity)} width={this.props.width} onChangeColor={c => {
                        if (!isNil(c)) {
                            const color = tinycolor(c).toHexString();
                            const opacity = c.a;
                            const newStyle = assign({}, this.props.shapeStyle, {
                                [styleType]: assign({}, style, {color, opacity})
                            });
                            this.props.setStyleParameter(newStyle);
                        }
                    }}/>
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Message msgId="draw.strokeWidth"/>
                </Col>
                <Col xs={6} style={{position: 'static'}}>
                    <div className="mapstore-slider with-tooltip">
                        <Slider tooltips step={1}
                            start={[style.weight]}
                            format={{
                                from: value => Math.round(value),
                                to: value => Math.round(value) + ' px'
                            }}
                            range={{min: 1, max: 15}}
                            onChange={(values) => {
                                const weight = parseInt(values[0].replace(' px', ''), 10);
                                const newStyle = assign({}, this.props.shapeStyle, {
                                    [styleType]: assign({}, style, {weight})
                                });
                                this.props.setStyleParameter(newStyle);
                            }}
                        />
                    </div>
                </Col>
            </Row>
        </Grid>);
    }
    addOpacityToColor = (color, opacity) => {
        return assign({}, color, {
            a: opacity
        });
    }
}

module.exports = StylePolygon;
