/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const {Row, Col} = require('react-bootstrap');
const {isNil} = require('lodash');
const tinycolor = require("tinycolor2");

// number localizer?
const numberLocalizer = require('react-widgets/lib/localizers/simple-number');
// not sure this is needed, TODO check!
numberLocalizer();

const Message = require('../../I18N/Message');
const OpacitySlider = require('../../TOC/fragments/OpacitySlider');
const ColorSelector = require('../ColorSelector').default;
const {addOpacityToColor} = require('../../../utils/VectorStyleUtils');

/**
 * Styler for the stroke properties of a vector style
*/
class Fill extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        defaultColor: PropTypes.string,
        onChange: PropTypes.func,
        width: PropTypes.number
    };

    static defaultProps = {
        style: {},
        onChange: () => {}
    };

    render() {
        const {style} = this.props;
        return (<div>
            <Row>
                <Col xs={12}>
                    <strong><Message msgId="draw.fill"/></strong>
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Message msgId="draw.color"/>
                </Col>
                <Col xs={6} style={{position: "static"}}>
                    <ColorSelector color={addOpacityToColor(tinycolor(style.fillColor || this.props.defaultColor).toRgb(), style.fillOpacity)} width={this.props.width}
                        onChangeColor={c => {
                            if (!isNil(c)) {
                                const fillColor = tinycolor(c).toHexString();
                                const fillOpacity = c.a;
                                this.props.onChange(style.id, {fillColor, fillOpacity});
                            }
                        }}/>
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Message msgId="draw.opacity"/>
                </Col>
                <Col xs={6} style={{position: 'static'}}>
                    <OpacitySlider
                        opacity={style.fillOpacity}
                        onChange={(fillOpacity) => {
                            this.props.onChange(style.id, {fillOpacity});
                        }}/>
                </Col>
            </Row>
        </div>);
    }
}

module.exports = Fill;
