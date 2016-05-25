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
        busy: React.PropTypes.bool,
        style: React.PropTypes.object,
        valueField: React.PropTypes.string,
        textField: React.PropTypes.string,
        fieldOptions: React.PropTypes.array,
        fieldName: React.PropTypes.string,
        fieldRowId: React.PropTypes.number,
        attType: React.PropTypes.string,
        fieldValue: React.PropTypes.oneOfType([
            React.PropTypes.number,
            React.PropTypes.string
        ]),
        fieldException: React.PropTypes.object,
        comboFilterType: React.PropTypes.oneOfType([
            React.PropTypes.bool,
            React.PropTypes.string,
            React.PropTypes.func
        ]),
        disabled: React.PropTypes.bool,
        options: React.PropTypes.object,
        onUpdateField: React.PropTypes.func,
        onToggle: React.PropTypes.func,
        onSearch: React.PropTypes.func,
        onUpdateExceptionField: React.PropTypes.func
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            options: {},
            busy: false,
            style: {
                width: "100%"
            },
            disabled: false,
            valueField: null,
            textField: null,
            fieldOptions: [],
            fieldName: null,
            fieldRowId: null,
            fieldValue: null,
            fieldException: null,
            comboFilterType: false,
            onUpdateField: () => {},
            onToggle: () => {},
            onSearch: () => {},
            onUpdateExceptionField: () => {}
        };
    },
    render() {
        const style = assign({}, this.props.style, {marginBottom: "15px"});

        const placeholder = LocaleUtils.getMessageById(this.context.messages, "queryform.attributefilter.combo_placeholder");

        const ddList = this.props.valueField !== null && this.props.textField !== null ? (
            <DropdownList
                {...this.props.options}
                busy={this.props.busy}
                disabled={this.props.disabled}
                valueField={this.props.valueField}
                textField={this.props.textField}
                data={this.props.fieldOptions}
                value={this.props.fieldValue}
                caseSensitive={false}
                minLength={3}
                placeholder={placeholder}
                filter={this.props.comboFilterType}
                style={style}
                onChange={(value) => this.props.onUpdateField(this.props.fieldRowId, this.props.fieldName, value[this.props.valueField], this.props.attType, value)}
                onToggle={this.props.onToggle}
                onSearch={this.props.onSearch}/>
        ) : (
            <DropdownList
                {...this.props.options}
                busy={this.props.busy}
                disabled={this.props.disabled}
                data={this.props.fieldOptions}
                value={this.props.fieldValue}
                caseSensitive={false}
                minLength={3}
                placeholder={placeholder}
                filter={this.props.comboFilterType}
                style={style}
                onChange={(value) => this.props.onUpdateField(this.props.fieldRowId, this.props.fieldName, value, this.props.attType)}
                onToggle={this.props.onToggle}
                onSearch={this.props.onSearch}/>
        );

        return ddList;
    }
});

module.exports = ComboField;
