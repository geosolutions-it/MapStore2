/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const {Row, Col, FormControl} = require('react-bootstrap');
const Combobox = require('react-widgets').Combobox;

const numberLocalizer = require('react-widgets/lib/localizers/simple-number');
// not sure this is needed, TODO check!
numberLocalizer();

const Message = require('../../I18N/Message');
const LocaleUtils = require('../../../utils/LocaleUtils');
const {createFont} = require('../../../utils/AnnotationsUtils');

/**
 * Styler for the stroke properties of a vector style
*/
class Text extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        onChange: PropTypes.func,
        addOpacityToColor: PropTypes.func,
        width: PropTypes.number,
        uomValues: PropTypes.array,
        alignValues: PropTypes.array,
        fontStyleValues: PropTypes.array,
        fontWeightValues: PropTypes.array,
        fontFamilyValues: PropTypes.array,
        shapeStyle: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        style: {},
        onChange: () => {},
        uomValues: [{value: "px"}, {value: "em"}],
        fontWeightValues: [{value: "normal"}, {value: "bold"}],
        alignValues: [{value: "start", label: "left"}, {value: "center", label: "center"}, {value: "end", label: "right"}],
        fontStyleValues: [{value: "normal"}, {value: "italic"}],
        fontFamilyValues: [{value: "Arial"}, {value: "Helvetica"}, {value: "sans-serif"}, {value: "Courier"}],
        shapeStyle: {}
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
        const {style} = this.props;
        return (<div>
            <Row>
                <Col xs={12}>
                    <strong><Message msgId="draw.fontTitle"/></strong>
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
                            this.props.onChange(style.id, {fontFamily, font});
                        }}
                    />
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Message msgId="draw.font.size"/>
                </Col>
                <Col xs={4} style={{position: 'static'}}>
                    <FormControl
                        value={style.fontSize || 14}
                        placeholder=""
                        onChange={(e) => {
                            const fontSize = e.target.value || 14;
                            const font = createFont({...style, fontSize});
                            this.props.onChange(style.id, {fontSize, font});
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
                            this.props.onChange(style.id, {fontSizeUom, font});
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
                            this.props.onChange(style.id, {fontStyle, font});
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
                            this.props.onChange(style.id, {fontWeight, font});
                        }}
                    />
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <strong><Message msgId="draw.text"/></strong>
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
                            this.props.onChange(style.id, {textAlign});
                        }}
                    />
                </Col>
            </Row>
        </div>);
    }
}

module.exports = Text;
