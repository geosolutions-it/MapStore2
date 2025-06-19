/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';
import ComboField from './ComboField';

import localizedProps from '../../misc/enhancers/localizedProps';

// support for localized attribute names and placeholder
export const AttributeNameField = localizedProps('placeholder')(localizedProps('fieldOptions', 'label', 'object')(ComboField));

class FilterField extends React.Component {
    static propTypes = {
        dropUp: PropTypes.bool,
        attributes: PropTypes.array,
        filterField: PropTypes.object,
        operatorOptions: PropTypes.array,
        onUpdateField: PropTypes.func,
        maxFeaturesWPS: PropTypes.number,
        toggleMenu: PropTypes.func,
        deleteButton: PropTypes.node,
        onUpdateExceptionField: PropTypes.func,
        onChangeCascadingValue: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        attributes: [],
        filterField: null,
        operatorOptions: ["=", ">", "<", ">=", "<=", "<>", "><"],
        onUpdateField: () => {},
        toggleMenu: () => {},
        onUpdateExceptionField: () => {},
        onChangeCascadingValue: () => {}
    };

    renderOperatorField = () => {
        return (
            <ComboField
                dropUp={this.props.dropUp}
                fieldOptions= {this.props.operatorOptions}
                fieldName="operator"
                fieldRowId={this.props.filterField.rowId}
                fieldValue={this.props.filterField.operator}
                onUpdateField={this.updateFieldElement}/>
        );
    };

    renderValueField = (selectedAttribute) => {
        const valueElement = React.cloneElement(
            React.Children.toArray(this.props.children).filter((node) => node.props.attType === selectedAttribute.type)[0],
            Object.assign({
                fieldName: "value",
                fieldRowId: this.props.filterField.rowId,
                fieldValue: this.props.filterField.value,
                fieldException: this.props.filterField.exception,
                onUpdateField: this.updateFieldElement,
                toggleMenu: this.props.toggleMenu,
                maxFeaturesWPS: this.props.maxFeaturesWPS,
                onUpdateExceptionField: this.updateExceptionFieldElement
            }, selectedAttribute.fieldOptions || {})
        );

        return (
            valueElement
        );
    };

    render() {
        let selectedAttribute = this.props.attributes.filter((attribute) => attribute.attribute === this.props.filterField.attribute)[0];

        return (
            <div className="filter-field-row">
                <div className="filter-field-attribute">
                    <AttributeNameField
                        dropUp={this.props.dropUp}
                        valueField={'attribute'}
                        textField={'label'}
                        fieldOptions={this.props.attributes}
                        placeholder="queryform.attributefilter.combo_placeholder"
                        fieldValue={this.props.filterField.attribute}
                        attType={selectedAttribute && selectedAttribute.type}
                        fieldName="attribute"
                        fieldRowId={this.props.filterField.rowId}
                        onUpdateField={this.updateFieldElement}
                        comboFilter={"contains"}/>
                </div>
                <div className="filter-field-operator">{selectedAttribute ? this.renderOperatorField() : null}</div>
                <div className="filter-field-value">{selectedAttribute && this.props.filterField.operator ? this.renderValueField(selectedAttribute) : null}</div>
                {this.props.deleteButton ? <div className="filter-field-tools">{this.props.deleteButton}</div> : null}
            </div>
        );
    }

    updateExceptionFieldElement = (rowId, message) => {
        this.props.onUpdateExceptionField(rowId, message);
    };

    updateFieldElement = (rowId, name, value, type, fieldOptions) => {
        let selectedAttribute;
        if (name === "attribute") {
            selectedAttribute = this.props.attributes.filter((attribute) => attribute.attribute === value)[0];
            const fieldType = selectedAttribute && selectedAttribute.type || type;
            this.props.onUpdateField(rowId, name, value, fieldType, fieldOptions);

            if (fieldType === "array") {
                this.props.onUpdateField(rowId, "operator", "contains", fieldType, fieldOptions);
            }
        } else {
            this.props.onUpdateField(rowId, name, value, type === 'boolean' ? 'string' : type, fieldOptions);

        }

        if (name === "value") {
            // For cascading: filter the attributes that depends on
            let dependsOnAttributes = this.props.attributes.filter((attribute) => attribute.dependson && attribute.dependson.field === this.props.filterField.attribute);
            if (dependsOnAttributes.length > 0) {
                // Perhaps There is some filterFields that need to reset their value
                this.props.onChangeCascadingValue(dependsOnAttributes);
            }
        }
    };
}

export default FilterField;
