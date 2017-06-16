/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


const React = require('react');
const Combobox = require('react-widgets').Combobox;

const AutocompleteField = React.createClass({
    propTypes: {
        className: React.PropTypes.string,
        currentPage: React.PropTypes.number,
        disabled: React.PropTypes.bool,
        filterField: React.PropTypes.object,
        label: React.PropTypes.string,
        onUpdateField: React.PropTypes.func,
        paginated: React.PropTypes.bool,
        selectedValue: React.PropTypes.string,
        valuesCount: React.PropTypes.number
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            currentPage: 0,
            label: null,
            onUpdateField: () => {},
            paginated: false,
            selectedValue: null,
            valuesCount: 0
        };
    },
    getOptions() {
        return this.props.filterField &&
        this.props.filterField.options &&
        this.props.filterField.options[this.props.filterField.attribute] &&
        this.props.filterField.options[this.props.filterField.attribute].map(o => {
            return { value: o, label: o };
        });
    },
    render() {
        let label = this.props.label ? (<label>{this.props.label}</label>) : (<span/>);
        let selectedValue;
        if (this.props.filterField && this.props.filterField.value && this.props.filterField.value !== "*") {
            selectedValue = {
                'value': this.props.filterField.value,
                'label': this.props.filterField.value
            };
        }
        let options = this.getOptions() ? this.getOptions().slice(0) : [];
        if (this.props.paginated && options.length > 0) {
            options.push({ label: '', value: '', disabled: true, pagination: this.renderPagination() });
        }
        return (
            <div className="textField">
                {label}
                <Combobox
                    disabled={this.props.filterField.operator === "isNull"}
                    busy={this.props.filterField.loading}
                    filter="contains"
                    onChange={(input) => {
                        this.props.onUpdateField(this.props.filterField.rowId, "value", input, "string", this.props.currentPage);
                    }}
                    onSelect={(input) => { console.log("onSelect" + input); }}
                    onFocus={() => { this.loadWithoutfilter(options); }}
                    valueField="value"
                    textField="label"
                    data={this.props.filterField.loading ? [] : options}
                    onToggle={() => { this.loadWithoutfilter(options); }}
                    value={selectedValue && selectedValue.value}
                    />
            </div>);
    },
    loadWithoutfilter(options) {
        if (options.length === 0 && !this.props.filterField.value) {
            this.props.onUpdateField(this.props.filterField.rowId, "value", "", "string", this.props.currentPage);
        }
    }
});

module.exports = AutocompleteField;
