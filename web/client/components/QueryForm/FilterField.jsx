/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Row, Col} = require('react-bootstrap');

const ComboField = require('./ComboField');

const FilterField = React.createClass({
    propTypes: {
        attributes: React.PropTypes.array,
        filterField: React.PropTypes.object,
        operatorOptions: React.PropTypes.array,
        onUpdateField: React.PropTypes.func,
        onUpdateExceptionField: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            attributes: [],
            filterField: null,
            operatorOptions: [" ", "=", ">", "<", ">=", "<=", "<>"],
            onUpdateField: () => {},
            onUpdateExceptionField: () => {}
        };
    },
    renderOperatorField() {
        return (
            <ComboField
                fieldOptions= {this.props.operatorOptions}
                fieldName="operator"
                fieldRowId={this.props.filterField.rowId}
                fieldValue={this.props.filterField.operator}
                onUpdateField={this.updateFieldElement}/>
        );
    },
    renderValueField(selectedAttribute) {
        const valueElement = React.cloneElement(
            React.Children.toArray(this.props.children).filter((node) => node.props.attType === selectedAttribute.type)[0],
            {
                fieldName: "value",
                fieldRowId: this.props.filterField.rowId,
                fieldValue: this.props.filterField.value,
                fieldException: this.props.filterField.exception,
                onUpdateField: this.updateFieldElement,
                onUpdateExceptionField: this.updateExceptionFieldElement
            }
        );

        return (
            valueElement
        );
    },
    render() {
        let selectedAttribute = this.props.attributes.filter((attribute) => attribute.id === this.props.filterField.attribute)[0];

        return (
            <Row>
                <Col xs={4}>
                    <ComboField
                        fieldOptions={[null, ...this.props.attributes.map((attribute) => attribute.id)]}
                        fieldName="attribute"
                        fieldRowId={this.props.filterField.rowId}
                        fieldValue={this.props.filterField.attribute}
                        onUpdateField={this.updateFieldElement}/>
                </Col>
                <Col xs={2}>{selectedAttribute ? this.renderOperatorField() : null}</Col>
                <Col xs={6}>{selectedAttribute && this.props.filterField.operator ? this.renderValueField(selectedAttribute) : null}</Col>
            </Row>
        );
    },
    updateExceptionFieldElement(rowId, message) {
        this.props.onUpdateExceptionField(rowId, message);
    },
    updateFieldElement(rowId, name, value) {
        this.props.onUpdateField(rowId, name, value);
    }
});

module.exports = FilterField;
