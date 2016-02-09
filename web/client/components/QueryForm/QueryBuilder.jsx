/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Row, Col, Button, Glyphicon} = require('react-bootstrap');

const FilterField = require('./FilterField');
const ComboField = require('./ComboField');
const DateField = require('./DateField');

const QueryBuilder = React.createClass({
    propTypes: {
        filterFields: React.PropTypes.array,
        attributes: React.PropTypes.array,
        fieldWidth: React.PropTypes.string,
        removeButtonIcon: React.PropTypes.string,
        addButtonIcon: React.PropTypes.string,
        onAddFilterField: React.PropTypes.func,
        onRemoveFilterField: React.PropTypes.func,
        onUpdateFilterField: React.PropTypes.func,
        onUpdateExceptionField: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            filterFields: [],
            attributes: [],
            fieldWidth: "100%",
            removeButtonIcon: "glyphicon glyphicon-minus",
            addButtonIcon: "glyphicon glyphicon-plus",
            onAddFilterField: () => {},
            onRemoveFilterField: () => {},
            onUpdateFilterField: () => {},
            onUpdateExceptionField: () => {}
        };
    },
    getComboValues(selected, attributes) {
        if (selected && selected.dependson) {
            // //////////////////////////////////////////////////////////
            // Retrieving the filterField related the selected Province
            // //////////////////////////////////////////////////////////
            let filterField = this.props.filterFields.filter((field) => field.attribute === selected.dependson.field)[0];
            if (filterField && filterField.value) {
                // The complete attribute config object
                let attribute = attributes.filter((attr) => attr.id === filterField.attribute)[0];
                // The reference ID of the related attribute field value
                let attributeRefId = attribute.values.filter((value) => value.name === filterField.value)[0][selected.dependson.from];
                // The filtered values that match the attribute refId
                let values = selected.values.filter((value) => value[selected.dependson.to] === attributeRefId);

                return (selected && selected.type === "list" ? values.map((value) => value.name || value) : null);
            }
        }

        return (selected && selected.type === "list" ? selected.values.map((value) => value.name || value) : null);
    },
    renderFilterField(filterField) {
        let selectedAttribute = this.props.attributes.filter((attribute) => attribute.id === filterField.attribute)[0];
        let comboValues = this.getComboValues(selectedAttribute, this.props.attributes);

        return (
            <Row key={filterField.rowId}>
                <Col xs={10}>
                    <FilterField
                        attributes={this.props.attributes}
                        filterField={filterField}
                        operatorOptions={selectedAttribute && selectedAttribute.type === "list" ? ["="] : ["=", ">", "<", ">=", "<=", "<>", "><"]}
                        onUpdateField={this.props.onUpdateFilterField}
                        onUpdateExceptionField={this.props.onUpdateExceptionField}>
                        <ComboField
                            attType="list"
                            width={this.props.fieldWidth}
                            fieldOptions={comboValues ? [null, ...comboValues] : []}/>
                        <DateField attType="date"
                            operator={filterField.operator}/>
                    </FilterField>
                </Col>
                <Col xs={2}>
                    <Button onClick={() => this.props.onRemoveFilterField(filterField.rowId)}><Glyphicon glyph={this.props.removeButtonIcon}/></Button>
                </Col>
            </Row>
        );
    },
    render() {
        return (
            <form>
                {this.props.filterFields.map(this.renderFilterField)}
                <Button onClick={this.props.onAddFilterField}><Glyphicon glyph={this.props.addButtonIcon}/></Button>
            </form>
        );
    }
});

module.exports = QueryBuilder;
