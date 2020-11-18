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
import { isNil, isEqual } from 'lodash';
import tinycolor from 'tinycolor2';
import Slider from 'react-nouislider';

// number localizer?
import numberLocalizer from 'react-widgets/lib/localizers/simple-number';

// not sure this is needed, TODO check!
numberLocalizer();
import Message from '../../I18N/Message';
import OpacitySlider from '../../TOC/fragments/OpacitySlider';
import ColorSelector from '../ColorSelector';
import DashArray from './DashArray';
import { addOpacityToColor } from '../../../utils/VectorStyleUtils';

/**
 * Styler for the stroke properties of a vector style
*/
class Stroke extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        defaultColor: PropTypes.string,
        lineDashOptions: PropTypes.array,
        onChange: PropTypes.func,
        width: PropTypes.number,
        constraints: PropTypes.object
    };

    static defaultProps = {
        style: {},
        constraints: {
            maxWidth: 15,
            minWidth: 1
        },
        onChange: () => {}
    };

    shouldComponentUpdate(nextProps) {
        return !isEqual(this.props.style, nextProps.style)
         || !isEqual(this.props.lineDashOptions, nextProps.lineDashOptions);
    }
    render() {
        const {style} = this.props;
        return (<div>
            <Row>
                <Col xs={12}>
                    <strong><Message msgId="draw.stroke"/></strong>
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Message msgId="draw.lineDash"/>
                </Col>
                <Col xs={6} style={{position: "static"}}>
                    <DashArray
                        options={this.props.lineDashOptions}
                        dashArray={style.dashArray}
                        onChange={(dashArray) => {
                            this.props.onChange(style.id, {dashArray});
                        }}
                    />
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Message msgId="draw.color"/>
                </Col>
                <Col xs={6} style={{position: "static"}}>
                    <ColorSelector color={addOpacityToColor(tinycolor(style.color || this.props.defaultColor).toRgb(), style.opacity)} width={this.props.width}
                        onChangeColor={c => {
                            if (!isNil(c)) {
                                const color = tinycolor(c).toHexString();
                                const opacity = c.a;
                                this.props.onChange(style.id, {color, opacity});
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
                        opacity={isNil(style.opacity) ? 0.2 : style.opacity}
                        onChange={(opacity) => {
                            this.props.onChange(style.id, {opacity});
                        }}/>
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Message msgId="draw.width"/>
                </Col>
                <Col xs={6} style={{position: "static"}}>
                    <div className="mapstore-slider with-tooltip">
                        <Slider
                            tooltips
                            step={1}
                            start={[style.weight || style.width || 1]}
                            format={{
                                from: value => Math.round(value),
                                to: value => Math.round(value) + ' px'
                            }}
                            range={{
                                min: isNil(this.props.constraints && this.props.constraints.minWidth) ? 1 : this.props.constraints.maxWidth,
                                max: this.props.constraints && this.props.constraints.maxWidth || 15
                            }}
                            onChange={(values) => {
                                const weight = parseInt(values[0].replace(' px', ''), 10);
                                this.props.onChange(style.id, {weight});
                            }}
                        />
                    </div>
                </Col>
            </Row>
        </div>);
    }
}

export default Stroke;
