/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const assign = require('object-assign');

const {DropdownList} = require('react-widgets');

const LocaleUtils = require('../../../utils/LocaleUtils');

const ComboField = React.createClass({
    propTypes: {
        style: React.PropTypes.object,
        fieldOptions: React.PropTypes.array,
        fieldName: React.PropTypes.string,
        fieldRowId: React.PropTypes.number,
        fieldValue: React.PropTypes.string,
        fieldException: React.PropTypes.object,
        comboFilterType: React.PropTypes.oneOfType([
            React.PropTypes.bool,
            React.PropTypes.string
        ]),
        onUpdateField: React.PropTypes.func,
        onUpdateExceptionField: React.PropTypes.func
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            style: {
                width: "100%"
            },
            fieldOptions: [],
            fieldName: null,
            fieldRowId: null,
            fieldValue: null,
            fieldException: null,
            comboFilterType: false,
            onUpdateField: () => {},
            onUpdateExceptionField: () => {}
        };
    },
    render() {
        const style = assign({}, this.props.style, {marginBottom: "15px"});

        const placeholder = LocaleUtils.getMessageById(this.context.messages, "queryform.attributefilter.combo_placeholder");
        return (
            <DropdownList
                data={this.props.fieldOptions}
                value={this.props.fieldValue}
                caseSensitive={false}
                minLength={3}
                placeholder={placeholder}
                filter={this.props.comboFilterType}
                style={style}
                onChange={(value) => this.props.onUpdateField(this.props.fieldRowId, this.props.fieldName, value)}/>
        );
    }
});

module.exports = ComboField;
