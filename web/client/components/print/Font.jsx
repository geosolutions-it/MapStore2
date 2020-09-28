const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Choice = require('./Choice');
const {Grid, Row, Col, Button, Glyphicon} = require('react-bootstrap');
const IntlNumberFormControl = require('../I18N/IntlNumberFormControl');

class Font extends React.Component {
    static propTypes = {
        fonts: PropTypes.array,
        label: PropTypes.string,
        onChangeFamily: PropTypes.func,
        onChangeSize: PropTypes.func,
        onChangeBold: PropTypes.func,
        onChangeItalic: PropTypes.func,
        family: PropTypes.string,
        size: PropTypes.number,
        bold: PropTypes.bool,
        italic: PropTypes.bool
    };

    static defaultProps = {
        fonts: ['Verdana', 'Serif', 'SansSerif', 'Arial', 'Courier New', 'Tahoma', 'Times New Roman'],
        label: 'Font',
        onChangeFamily: () => {},
        onChangeSize: () => {},
        family: '',
        size: 8,
        bold: false,
        italic: false
    };

    onChangeFamily = (family) => {
        this.props.onChangeFamily(family);
    };

    onChangeSize = (val) => {
        this.props.onChangeSize(parseInt(val, 10));
    };

    render() {
        return (
            <Grid fluid>
                <Row>
                    <Col xs={12}>
                        <label className="control-label">{this.props.label}</label>
                    </Col>
                </Row>
                <Row>
                    <Col xs={5}>
                        <Choice ref="family" onChange={this.onChangeFamily} label="" items={this.props.fonts.map((font) => ({name: font, value: font}))}
                            selected={this.props.family}/>
                    </Col>
                    <Col xs={3}>
                        <IntlNumberFormControl ref="size" type="number" value={this.props.size} min={0} precision={0} onChange={this.onChangeSize}/>
                    </Col>
                    <Col xs={2}>
                        <Button bsStyle="primary" bsSize="small" active={this.props.bold} onClick={this.toggleBold}><Glyphicon glyph="bold"/></Button>
                    </Col>
                    <Col xs={2}>
                        <Button bsStyle="primary" bsSize="small" active={this.props.italic} onClick={this.toggleItalic}><Glyphicon glyph="italic"/></Button>
                    </Col>
                </Row>
            </Grid>
        );
    }

    toggleBold = () => {
        this.props.onChangeBold(!this.props.bold);
    };

    toggleItalic = () => {
        this.props.onChangeItalic(!this.props.italic);
    };
}

module.exports = Font;
