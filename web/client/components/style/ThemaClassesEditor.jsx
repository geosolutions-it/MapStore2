/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const { Grid, Row, Col, FormGroup} = require('react-bootstrap');
const ColorPicker = require('./ColorPicker');
const numberLocalizer = require('react-widgets/lib/localizers/simple-number');
numberLocalizer();
const {NumberPicker} = require('react-widgets');
const tinycolor = require('tinycolor2');
const assign = require('object-assign');

class ThemaClassesEditor extends React.Component {
    static propTypes = {
        classification: PropTypes.array,
        onUpdateClasses: PropTypes.func,
        className: PropTypes.string
    };

    static defaultProps = {
        classification: [],
        onUpdateClasses: () => {},
        className: ""
    };

    renderClasses = () => {
        return this.props.classification.map((classItem, index) => (<Row>
            <FormGroup>
                <Col xs="4">
                    <ColorPicker key={classItem.color}
                        pickerProps={{ disableAlpha: true }}
                        text={classItem.color} value={{ ...tinycolor(classItem.color).toRgb(), a: 100 }}
                        onChangeColor={(color) => this.updateColor(index, color)} />
                </Col>
                <Col xs="4">
                    <NumberPicker
                        format="- ###.###"
                        value={classItem.min}
                        onChange={(value) => this.updateMin(index, value)}
                    />
                </Col>
                <Col xs="4">
                    <NumberPicker
                        format="- ###.###"
                        value={classItem.max}
                        precision={3}
                        onChange={(value) => this.updateMax(index, value)}
                    />
                </Col>
            </FormGroup>
        </Row>));
    };

    render() {
        return (<div className={"thema-classes-editor " + this.props.className}><Grid fluid>
                <Row>
                    {this.renderClasses()}
                </Row>
            </Grid></div>);
    }

    updateColor = (classIndex, color) => {
        if (color) {
            const newClassification = this.props.classification.map((classItem, index) => {
                return index === classIndex ? assign({}, classItem, {
                    color: tinycolor(color).toHexString()
                }) : classItem;
            });
            this.props.onUpdateClasses(newClassification);
        }
    };

    updateMin = (classIndex, min) => {
        if (!isNaN(min)) {
            const newClassification = this.props.classification.map((classItem, index) => {
                if (index === classIndex) {
                    return assign({}, classItem, {
                        min
                    });
                }
                if (index === (classIndex - 1)) {
                    return assign({}, classItem, {
                        max: min
                    });
                }
                return classItem;
            });
            this.props.onUpdateClasses(newClassification, true);
        }
    };

    updateMax = (classIndex, max) => {
        if (!isNaN(max)) {
            const newClassification = this.props.classification.map((classItem, index) => {
                if (index === classIndex) {
                    return assign({}, classItem, {
                        max
                    });
                }
                if (index === (classIndex + 1)) {
                    return assign({}, classItem, {
                        min: max
                    });
                }
                return classItem;
            });
            this.props.onUpdateClasses(newClassification);
        }
    };
}

module.exports = ThemaClassesEditor;
