/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import {DropdownButton, FormControl, FormGroup, Glyphicon, MenuItem} from 'react-bootstrap';
import ColorSelector from './ColorSelector';
import isNumber from 'lodash/isNumber';
import isNil from 'lodash/isNil';
import numberLocalizer from 'react-widgets/lib/localizers/simple-number';
numberLocalizer();
import { NumberPicker } from 'react-widgets';
import assign from 'object-assign';
import Message from "../../components/I18N/Message";

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

    renderFieldByClassification = (classItem, index) => {
        let fieldRender;
        if (!isNil(classItem.unique)) {
            if (isNumber(classItem.unique)) {
                fieldRender = (<NumberPicker
                    format="- ###.###"
                    value={classItem.unique}
                    onChange={(value) => this.updateUnique(index, value, 'number')}
                />);
            } else {
                fieldRender = (<FormControl
                    value={classItem.unique}
                    type="text"
                    onChange={ e => this.updateUnique(index, e.target.value)}
                />);
            }
        } else if (!isNil(classItem.min)) {
            fieldRender =  <>
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
            </>;
        } else {
            fieldRender = <>
                <FormControl value={classItem.label} type="text" onChange={ e => this.updateRaster(index, e.target.value)} />
                <NumberPicker
                    format="- ###.###"
                    value={classItem.quantity}
                    onChange={(value) => this.updateRaster(index, value, 'number')}
                />
            </>;
        }
        return fieldRender;
    }

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
                { this.renderFieldByClassification(classItem, index) }
                <DropdownButton
                    style={{flex: 0}}
                    className="square-button-md no-border add-rule"
                    noCaret
                    pullRight
                    title={<Glyphicon glyph="option-vertical"/>}>
                    {[
                        {labelId: 'styleeditor.addRuleBefore', glyph: 'add-row-before', value: "before"},
                        {labelId: 'styleeditor.addRuleAfter', glyph: 'add-row-after', value: "after"},
                        {labelId: 'styleeditor.remove', glyph: 'trash', value: "remove"}
                    ]
                        .map((option) => {
                            return  (
                                <MenuItem
                                    key={option.value}
                                    onClick={() => this.updateClassification(index, option.value)}>
                                    <><Glyphicon glyph={option.glyph}/>
                                        <Message msgId={option.labelId} />
                                    </>
                                </MenuItem>
                            );
                        })}
                </DropdownButton>
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

    updateUnique = (classIndex, unique, type = 'text') => {
        const newClassification = this.props.classification.map((classItem, index) => {
            if (index === classIndex) {
                return assign({}, classItem, {
                    unique: isNil(unique) ? type === 'number' ? 0 : '' : unique
                });
            }
            return classItem;
        });
        this.props.onUpdateClasses(newClassification, 'interval');
    };

    updateRaster = (classIndex, value, type = 'text') => {
        const fieldProp = type === 'number' ? 'quantity' : 'label';
        const newClassification = this.props.classification.map((classItem, index) => {
            if (index === classIndex) {
                return assign({}, classItem, {
                    [fieldProp]: value
                });
            }
            return classItem;
        });
        this.props.onUpdateClasses(newClassification, 'interval');
    };

    updateMin = (classIndex, min) => {
        if (!isNaN(min)) {
            const newClassification = this.props.classification.map((classItem, index) => {
                if (index === classIndex) {
                    return assign({}, classItem, {
                        min
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

    updateClassification = (classIndex, type) => {
        let updateIndex;
        let updateMinMax;
        let deleteCount = 0;
        let newClassification = [...this.props.classification];
        const currentRule = newClassification[classIndex];

        if (type === 'before') {
            const isFirstIndex = classIndex === 0;
            updateIndex = isFirstIndex ? 0 : classIndex;
            updateMinMax = { min: isFirstIndex ? isNil(currentRule.min) ? currentRule.min : 0 : currentRule.min,
                max: currentRule.min };
        } else if (type === 'after') {
            updateIndex = classIndex === newClassification.length - 1 ? newClassification.length : classIndex + 1;
            updateMinMax = { min: currentRule.max, max: currentRule.max };
        } else {
            updateIndex = classIndex;
            deleteCount = 1;
        }
        let args = [updateIndex, deleteCount];
        if (type !== 'remove') {
            const color = '#ffffff';
            let classifyObj;
            if (!isNil(currentRule.unique)) {
                const uniqueValue = isNumber(currentRule.unique) ? 0 : '';
                classifyObj = { ...currentRule, color, title: uniqueValue, unique: uniqueValue };
            } else if (!isNil(currentRule.quantity)) {
                classifyObj = { ...currentRule, color, label: '0', quantity: 0 };
            } else {
                classifyObj = { ...currentRule, ...updateMinMax, color,
                    title: ` >= ${updateMinMax.min} AND <${updateMinMax.max}`
                };
            }
            args = args.concat(classifyObj);
        }
        newClassification.splice(...args);
        this.props.onUpdateClasses(newClassification, 'interval');
    }
}

export default ThemaClassesEditor;
