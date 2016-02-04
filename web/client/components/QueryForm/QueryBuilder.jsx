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
        onAddFilterField: React.PropTypes.func,
        onRemoveFilterField: React.PropTypes.func,
        onUpdateFilterField: React.PropTypes.func,
        onUpdateExceptionField: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            filterFields: [],
            attributes: [],
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
                <Col xs={1}>
                    <Button onClick={() => this.props.onRemoveFilterField(filterField.rowId)}><Glyphicon glyph="glyphicon glyphicon-minus"/></Button>
                </Col>
                <Col xs={11}>
                    <FilterField
                        attributes={this.props.attributes}
                        filterField={filterField}
                        operatorOptions={selectedAttribute && selectedAttribute.type === "list" ? [" ", "="] : [" ", "=", ">", "<", ">=", "<=", "<>"]}
                        onUpdateField={this.props.onUpdateFilterField}
                        onUpdateExceptionField={this.props.onUpdateExceptionField}>
                        <ComboField
                            attType="list"
                            fieldOptions={selectedAttribute && selectedAttribute.type === "list" ? [null, ...selectedAttribute.values] : null}/>
                        <DateField attType="date"
                            operator={filterField.operator}/>
                    </FilterField>
                </Col>
            </Row>
        );
    },
    render() {
        return (
            <form>
                {this.props.filterFields.map(this.renderFilterField)}
                <Button onClick={this.props.onAddFilterField}><Glyphicon glyph="glyphicon glyphicon-plus"/></Button>
            </form>
        );
    }
});

module.exports = QueryBuilder;
