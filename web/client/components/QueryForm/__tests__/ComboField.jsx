/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Input} = require('react-bootstrap');

const ComboField = React.createClass({
    propTypes: {
        fieldOptions: React.PropTypes.array,
        fieldName: React.PropTypes.string,
        fieldRowId: React.PropTypes.number,
        fieldValue: React.PropTypes.string,
        fieldException: React.PropTypes.object,
        onUpdateField: React.PropTypes.func,
        onUpdateExceptionField: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            fieldOptions: [],
            fieldName: null,
            fieldRowId: null,
            fieldValue: null,
            fieldException: null,
            onUpdateField: () => {},
            onUpdateExceptionField: () => {}
        };
    },
    renderfieldOptions(fieldOpt) {
        return (<option key={fieldOpt} value={fieldOpt}>{fieldOpt}</option>);
    },
    render() {
        const style = {width: "250px"};
        return (
            <Input
                key={this.props.fieldValue}
                type="select"
                style={style}
                placeholder="select"
                value={this.props.fieldValue}
                onChange={(evt) => this.props.onUpdateField(this.props.fieldRowId, this.props.fieldName, evt.target.value)}>
                {this.props.fieldOptions.map(this.renderfieldOptions)}
            </Input>
        );
    }
});

module.exports = ComboField;
