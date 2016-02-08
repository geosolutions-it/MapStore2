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
    renderFilterField(filterField) {
        let selectedAttribute = this.props.attributes.filter((attribute) => attribute.id === filterField.attribute)[0];

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
                            fieldOptions={selectedAttribute && selectedAttribute.type === "list" ? [null, ...selectedAttribute.values] : null}/>
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
