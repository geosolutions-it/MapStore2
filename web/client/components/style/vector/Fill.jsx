/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import PropTypes from 'prop-types';

import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { isNil } from 'lodash';
import tinycolor from 'tinycolor2';

// number localizer?
import numberLocalizer from 'react-widgets/lib/localizers/simple-number';

// not sure this is needed, TODO check!
numberLocalizer();

import Message from '../../I18N/Message';
import OpacitySlider from '../../TOC/fragments/OpacitySlider';
import ColorSelector from '../ColorSelector';
import { addOpacityToColor } from '../../../utils/VectorStyleUtils';

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

export default Fill;
