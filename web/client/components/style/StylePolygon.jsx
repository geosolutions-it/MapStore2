import PropTypes from 'prop-types';

/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';
import ColorPicker from './ColorPicker';
import StyleCanvas from './StyleCanvas';
import numberLocalizer from 'react-widgets/lib/localizers/simple-number';
numberLocalizer();
import { NumberPicker } from 'react-widgets';
import 'react-widgets/lib/less/react-widgets.less';

class StylePolygon extends React.Component {
    static propTypes = {
        shapeStyle: PropTypes.object,
        setStyleParameter: PropTypes.func
    };

    static defaultProps = {
        shapeStyle: {},
        setStyleParameter: () => {}
    };

    render() {
        return (<Grid fluid>
            <Row>
                <Col xs={4} style={{padding: 0}}>
                    <StyleCanvas style={{ padding: 0, margin: "auto", display: "block"}}
                        shapeStyle={this.props.shapeStyle}
                        geomType="Polygon"
                    />
                </Col>
                <Col xs={7}>
                    <Row style={{marginTop: 7}}>
                        <Col xs={4}>
                            <ColorPicker
                                value={this.props.shapeStyle.color}
                                line={false}
                                text="Stroke"
                                onChangeColor={(color) => {if (color) { this.props.setStyleParameter("color", color); } }} />
                        </Col>
                        <Col xs={8} style={{paddingRight: 0, paddingLeft: 30}}>
                            <NumberPicker
                                min={1} max={15} step={1}
                                value={this.props.shapeStyle.width}
                                onChange={(number) => {
                                    if (number !== this.props.shapeStyle.width) {
                                        this.props.setStyleParameter("width", number);
                                    }
                                }}  />
                        </Col>
                    </Row>
                    <Row style={{marginTop: 4}}>
                        <Col xs={6}>
                            <ColorPicker
                                value={this.props.shapeStyle.fill}
                                line={false}
                                text="Fill"
                                onChangeColor={(color) => { if (color) { this.props.setStyleParameter("fill", color); } }} />
                        </Col>

                    </Row>
                </Col>
            </Row>
        </Grid>);
    }
}

export default StylePolygon;
