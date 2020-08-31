/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const { FormGroup } = require('react-bootstrap');
const ColorSelector = require('./ColorSelector').default;
const numberLocalizer = require('react-widgets/lib/localizers/simple-number');
numberLocalizer();
const {NumberPicker} = require('react-widgets');
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
        return this.props.classification.map((classItem, index) => (
            <FormGroup
                key={index}>
                <ColorSelector
                    key={classItem.color}
                    color={classItem.color}
                    disableAlpha
                    format="hex"
                    onChangeColor={(color) => this.updateColor(index, color)}
                />
                <NumberPicker
                    format="- ###.###"
                    value={classItem.min}
                    onChange={(value) => this.updateMin(index, value)}
                />
                <NumberPicker
                    format="- ###.###"
                    value={classItem.max}
                    precision={3}
                    onChange={(value) => this.updateMax(index, value)}
                />
            </FormGroup>
        ));
    };

    render() {
        return (<div className={"thema-classes-editor " + this.props.className}>
            {this.renderClasses()}
        </div>);
    }

    updateColor = (classIndex, color) => {
        if (color) {
            const newClassification = this.props.classification.map((classItem, index) => {
                return index === classIndex ? assign({}, classItem, {
                    color
                }) : classItem;
            });
            this.props.onUpdateClasses(newClassification, 'color');
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
            this.props.onUpdateClasses(newClassification, 'interval');
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
            this.props.onUpdateClasses(newClassification, 'interval');
        }
    };
}

module.exports = ThemaClassesEditor;
