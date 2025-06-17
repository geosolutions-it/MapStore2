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
import Message from "../../components/I18N/Message";
import { createPagedUniqueAutompleteStream } from '../../observables/autocomplete';
import { AutocompleteCombobox } from '../../components/misc/AutocompleteCombobox';
import ConfigUtils from '../../utils/ConfigUtils';
import { generateRandomHexColor } from '../../utils/ColorUtils';
import uuid from 'uuid';
class ThemaClassesEditor extends React.Component {
    static propTypes = {
        classification: PropTypes.array,
        onUpdateClasses: PropTypes.func,
        className: PropTypes.string,
        allowEmpty: PropTypes.bool,
        customLabels: PropTypes.bool,
        uniqueValuesClasses: PropTypes.bool,
        autoCompleteOptions: PropTypes.object,
        dropUpMenu: PropTypes.bool,
        usePresetColors: PropTypes.bool
    };

    static defaultProps = {
        classification: [],
        onUpdateClasses: () => {},
        className: "",
        allowEmpty: true,
        customLabels: false,
        uniqueValuesClasses: false,
        dropUpMenu: false
    };

    renderFieldByClassification = (classItem, index, uniqueValuesClasses, autoCompleteOptions) => {
        if (classItem.unique !== undefined) { // unique could be null
            if (classItem.unique === null) {
                return (<FormControl
                    value={'null'}
                    type="text"
                    disabled
                />);
            }
            if (isNumber(classItem.unique)) {
                return (<NumberPicker
                    format="- ###.###"
                    value={classItem.unique}
                    onChange={(value) => this.updateUnique(index, value, 'number')}
                />);
            }
            /** field classes with preset values - drop down autocomplete input */
            if (uniqueValuesClasses && autoCompleteOptions) {
                const { dropUpAutoComplete, classificationAttribute, layer } = autoCompleteOptions;
                return (
                    <AutocompleteCombobox
                        dropUp={dropUpAutoComplete}
                        openOnFocus={false}
                        autocompleteEnabled
                        column={{key: classificationAttribute}}
                        onChange={value => this.updateUnique(index, value)}
                        dataType="string"
                        typeName={layer.name}
                        url={ConfigUtils.getParsedUrl(layer.url, {"outputFormat": "json"})}
                        value={classItem.unique}
                        filter="contains"
                        autocompleteStreamFactory={createPagedUniqueAutompleteStream}/>);
            }
            /** field classes without preset values - text input  */
            return (<FormControl
                value={classItem.unique}
                type="text"
                onChange={ e => this.updateUnique(index, e.target.value)}
            />);
        }
        if (!isNil(classItem.min)) {
            return  <>
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
        }
        return (<>
            <FormControl value={classItem.label} type="text" onChange={ e => this.updateRaster(index, e.target.value)} />
            <NumberPicker
                format="- ###.###"
                value={classItem.quantity}
                onChange={(value) => this.updateRaster(index, value, 'number')}
            />
        </>);
    }

    renderClasses = () => {
        return this.props.classification.map((classItem, index, classification) => (
            <FormGroup
                key={classItem.id ?? index}>
                <ColorSelector
                    key={classItem.color}
                    color={classItem.color}
                    disableAlpha
                    format="hex"
                    onChangeColor={(color) => this.updateColor(index, color)}
                />
                { this.renderFieldByClassification(classItem, index, this.props.uniqueValuesClasses, this.props.autoCompleteOptions) }
                { this.props.customLabels &&
                    <FormControl
                        value={classItem.title}
                        type="text"
                        onChange={e => this.updateCustomLabel(index, e.target.value)}
                    />
                }
                <DropdownButton
                    style={{flex: 0}}
                    className="square-button-md no-border add-rule"
                    noCaret
                    pullRight
                    title={<Glyphicon glyph="option-vertical"/>}
                    dropup={this.props.dropUpMenu}>
                    {[
                        {labelId: 'styleeditor.addRuleBefore', glyph: 'add-row-before', value: "before"},
                        {labelId: 'styleeditor.addRuleAfter', glyph: 'add-row-after', value: "after"},
                        ...(!this.props.allowEmpty && !index ? [] : [{labelId: 'styleeditor.remove', glyph: 'trash', value: "remove"}])
                    ]
                        .map((option) => {
                            return  (
                                <MenuItem
                                    key={option.value}
                                    onClick={() => this.updateClassification(index, option.value, classification, this.props.customLabels)}>
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
                return index === classIndex ? Object.assign({}, classItem, {
                    color
                }) : classItem;
            });
            this.props.onUpdateClasses(newClassification, 'color');
        }
    };

    updateUnique = (classIndex, unique, type = 'text') => {
        const newClassification = this.props.classification.map((classItem, index) => {
            if (index === classIndex) {
                return Object.assign({}, classItem, {
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
                return Object.assign({}, classItem, {
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
                    return Object.assign({}, classItem, {
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
                    return Object.assign({}, classItem, {
                        max
                    });
                }
                if (index === (classIndex + 1)) {
                    return Object.assign({}, classItem, {
                        min: max
                    });
                }
                return classItem;
            });
            this.props.onUpdateClasses(newClassification, 'interval');
        }
    };

    updateClassification = (classIndex, type, classification, customLabels) => {
        let updateIndex;
        let updateMinMax;
        let deleteCount = 0;
        let newClassification = [...this.props.classification];
        const currentRule = newClassification[classIndex];
        const currentColors = classification.map(item => item.color);

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
            const color = this.props.usePresetColors ?  generateRandomHexColor(currentColors) : '#ffffff';
            let classifyObj;
            if (!isNil(currentRule.unique)) {
                const uniqueValue = isNumber(currentRule.unique) ? 0 : '';
                classifyObj = { ...currentRule, id: uuid.v1(), color, title: uniqueValue, unique: uniqueValue };
            } else if (!isNil(currentRule.quantity)) {
                classifyObj = { ...currentRule, id: uuid.v1(), color, label: '0', quantity: 0 };
            } else {
                classifyObj = { ...currentRule, id: uuid.v1(), ...updateMinMax, color,
                    title: !customLabels ? ` >= ${updateMinMax.min} AND <${updateMinMax.max}` : ""
                };
            }
            args = args.concat(classifyObj);
        }
        newClassification.splice(...args);
        this.props.onUpdateClasses(newClassification, 'interval');
    }

    updateCustomLabel = (classIndex, value) => {
        if (value !== undefined) {
            const newClassification = this.props.classification.map((classItem, index) => {
                return index === classIndex ? Object.assign({}, classItem, {
                    title: value
                }) : classItem;
            });
            this.props.onUpdateClasses(newClassification, 'title');
        }
    }
}

export default ThemaClassesEditor;
