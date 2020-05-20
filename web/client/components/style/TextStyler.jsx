/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const {Grid, Row, Col} = require('react-bootstrap');
const Combobox = require('react-widgets').Combobox;
const assign = require('object-assign');
const ColorSelector = require('./ColorSelector').default;
const StyleCanvas = require('./StyleCanvas');
const numberLocalizer = require('react-widgets/lib/localizers/simple-number');
numberLocalizer();
require('react-widgets/lib/less/react-widgets.less');
const LocaleUtils = require('../../utils/LocaleUtils');
const {createFont} = require('../../utils/AnnotationsUtils');
const Message = require('../I18N/Message');
const tinycolor = require("tinycolor2");
const IntlNumberFormControl = require('../I18N/IntlNumberFormControl');

class TextStyler extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        uomValues: PropTypes.array,
        alignValues: PropTypes.array,
        fontStyleValues: PropTypes.array,
        fontWeightValues: PropTypes.array,
        fontFamilyValues: PropTypes.array,
        shapeStyle: PropTypes.object,
        setStyleParameter: PropTypes.func,
        styleType: PropTypes.String
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        styleType: "Text",
        uomValues: [{value: "px"}, {value: "em"}],
        fontWeightValues: [{value: "normal"}, {value: "bold"}],
        alignValues: [{value: "start", label: "left"}, {value: "center", label: "center"}, {value: "end", label: "right"}],
        fontStyleValues: [{value: "normal"}, {value: "italic"}],
        fontFamilyValues: [{value: "Arial"}, {value: "Helvetica"}, {value: "sans-serif"}, {value: "Courier"}],
        shapeStyle: {},
        setStyleParameter: () => {}
    };

    state = {
        fontFamily: "Arial"
    };

    render() {
        const messages = {
            emptyList: LocaleUtils.getMessageById(this.context.messages, "queryform.attributefilter.autocomplete.emptyList"),
            open: LocaleUtils.getMessageById(this.context.messages, "queryform.attributefilter.autocomplete.open"),
            emptyFilter: LocaleUtils.getMessageById(this.context.messages, "queryform.attributefilter.autocomplete.emptyFilter")
        };
        const {styleType, shapeStyle} = this.props;
        const style = shapeStyle[styleType];
        return (<Grid fluid style={{ width: '100%' }} className="ms-style">
            <Row>
                <Col xs={12}>
                    <div className="ms-marker-preview" style={{display: 'flex', width: '100%', height: 104}}>
                        {<StyleCanvas style={{ padding: 0, margin: "auto", display: "block"}}
                            shapeStyle={assign({}, style, {
                                color: this.addOpacityToColor(tinycolor(style.color).toRgb(), style.opacity)
                            })}
                            geomType="Polyline"
                            height={40}
                        />}
                    </div>
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Message msgId="draw.font.textColor"/>
                </Col>
                <Col xs={6} style={{position: 'static'}}>
                    <ColorSelector color={this.addOpacityToColor(tinycolor(style.color).toRgb(), style.opacity)}
                        width={this.props.width}
                        onChangeColor={c => {
                            const color = tinycolor(c).toHexString();
                            const opacity = c.a;
                            const newStyle = assign({}, shapeStyle, {
                                [styleType]: assign({}, style, {color, opacity})
                            });
                            this.props.setStyleParameter(newStyle);
                        }}/>
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Message msgId="draw.font.family"/>
                </Col>
                <Col xs={6} style={{position: 'static'}}>
                    <Combobox
                        value={this.state.fontFamily || "Arial"}
                        textField="value"
                        valueField="value"
                        messages={messages}
                        data={this.props.fontFamilyValues}
                        onChange={(e) => {
                            let fontFamily = e.value ? e.value : e;
                            if (fontFamily === "") {
                                fontFamily = "Arial";
                            }
                            this.setState({fontFamily});
                            const font = createFont({...style, fontFamily});
                            const newStyle = assign({}, shapeStyle, {
                                [styleType]: assign({}, style, {fontFamily, font})
                            });
                            this.props.setStyleParameter(newStyle);
                        }}
                    />
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Message msgId="draw.font.size"/>
                </Col>
                <Col xs={4} style={{position: 'static'}}>
                    <IntlNumberFormControl
                        value={style.fontSize || 14}
                        placeholder=""
                        onChange={(val) => {
                            const fontSize = val;
                            const font = createFont({...style, fontSize});
                            const newStyle = assign({}, shapeStyle, {
                                [styleType]: assign({}, style, {fontSize, font})
                            });
                            this.props.setStyleParameter(newStyle);
                        }}
                        type="number"/>
                </Col>
                <Col xs={2}>
                    <Combobox
                        value={style.fontSizeUom || "px"}
                        textField="value"
                        valueField="value"
                        messages={messages}
                        data={this.props.uomValues}
                        onChange={(e) => {
                            let fontSizeUom = e.value ? e.value : e;
                            if (this.props.uomValues.map(f => f.value).indexOf(fontSizeUom) === -1) {
                                fontSizeUom = "px";
                            }
                            const font = createFont({...style, fontSizeUom});
                            const newStyle = assign({}, shapeStyle, {
                                [styleType]: assign({}, style, {fontSizeUom, font})
                            });
                            this.props.setStyleParameter(newStyle);
                        }}
                    />
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Message msgId="draw.font.textAlign"/>
                </Col>
                <Col xs={6} style={{position: 'static'}}>
                    <Combobox
                        value={style.textAlign || "center"}
                        textField="label"
                        valueField="value"
                        messages={messages}
                        data={this.props.alignValues}
                        onChange={(e) => {
                            let textAlign = e.value ? e.value : e;
                            if (this.props.alignValues.map(f => f.value).indexOf(textAlign) === -1) {
                                textAlign = "center";
                            }
                            const newStyle = assign({}, shapeStyle, {
                                [styleType]: assign({}, style, {textAlign})
                            });
                            this.props.setStyleParameter(newStyle);
                        }}
                    />
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Message msgId="draw.font.style"/>
                </Col>
                <Col xs={6} style={{position: 'static'}}>
                    <Combobox
                        value={style.fontStyle || "normal"}
                        textField="value"
                        valueField="value"
                        messages={messages}
                        data={this.props.fontStyleValues}
                        onChange={(e) => {
                            let fontStyle = e.value ? e.value : e;
                            if (this.props.fontStyleValues.map(f => f.value).indexOf(fontStyle) === -1) {
                                fontStyle = style.fontStyle;
                            }
                            const font = createFont({...style, fontStyle});
                            const newStyle = assign({}, shapeStyle, {
                                [styleType]: assign({}, style, {fontStyle, font})
                            });
                            this.props.setStyleParameter(newStyle);
                        }}
                    />
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Message msgId="draw.font.weight"/>
                </Col>
                <Col xs={6} style={{position: 'static'}}>
                    <Combobox
                        value={style.fontWeight || "normal"}
                        textField="value"
                        valueField="value"
                        messages={messages}
                        data={this.props.fontWeightValues}
                        onChange={(e) => {
                            let fontWeight = e.value ? e.value : e;
                            if (this.props.fontWeightValues.map(f => f.value).indexOf(fontWeight) === -1) {
                                fontWeight = style.fontWeight;
                            }
                            const font = createFont({...style, fontWeight});
                            const newStyle = assign({}, shapeStyle, {
                                [styleType]: assign({}, style, {fontWeight, font})
                            });
                            this.props.setStyleParameter(newStyle);
                        }}
                    />
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

module.exports = TextStyler;
