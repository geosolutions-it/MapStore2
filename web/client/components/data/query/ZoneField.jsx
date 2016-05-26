/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const ComboField = require('./ComboField');

const FilterUtils = require('../../../utils/FilterUtils');

const ZoneField = React.createClass({
    propTypes: {
        zoneId: React.PropTypes.number,
        url: React.PropTypes.string,
        typeName: React.PropTypes.string,
        wfs: React.PropTypes.string,
        busy: React.PropTypes.bool,
        values: React.PropTypes.array,
        value: React.PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.string,
            React.PropTypes.number
        ]),
        label: React.PropTypes.string,
        searchText: React.PropTypes.string,
        searchMethod: React.PropTypes.string,
        searchAttribute: React.PropTypes.string,
        sort: React.PropTypes.object,
        error: React.PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.string
        ]),
        comboFilterType: React.PropTypes.oneOfType([
            React.PropTypes.bool,
            React.PropTypes.string,
            React.PropTypes.func
        ]),
        open: React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        dependsOn: React.PropTypes.object,
        valueField: React.PropTypes.string,
        textField: React.PropTypes.string,
        onSearch: React.PropTypes.func,
        onFilter: React.PropTypes.func,
        onOpenMenu: React.PropTypes.func,
        onChange: React.PropTypes.func
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            zoneId: null,
            url: null,
            typeName: null,
            wfs: "1.1.0",
            busy: false,
            values: [],
            value: null,
            valueField: null,
            textField: null,
            label: null,
            disabled: false,
            error: null,
            searchText: "*",
            searchMethod: "ilike",
            searchAttribute: null,
            comboFilterType: "contains",
            onSearch: () => {},
            onFilter: () => {},
            onOpenMenu: () => {},
            onChange: () => {}
        };
    },
    getFilter(searchText = "*", operator = "=") {
        let filterObj = {
            filterFields: [{
                attribute: this.props.searchAttribute,
                operator: operator,
                value: searchText,
                type: "list"
            }]
        };

        if (this.props.dependsOn) {
            filterObj.filterFields.push({
                attribute: this.props.dependsOn.field,
                operator: "=",
                value: this.props.dependsOn.value,
                type: "list"
            });
        }

        const filter = FilterUtils.toOGCFilter(this.props.typeName, filterObj, this.props.wfs, this.props.sort || {
            sortBy: this.props.searchAttribute,
            sortOrder: "ASC"
        });
        return filter;
    },
    render() {
        let values = [];
        if (this.props.values && this.props.values.length > 0) {
            values = this.props.values.map((item) => {

                let valueField = item;
                this.props.valueField.split('.').forEach(part => {
                    valueField = valueField ? valueField[part] : null;
                });

                let textField = item;
                this.props.textField.split('.').forEach(part => {
                    textField = textField ? textField[part] : null;
                });

                return {id: valueField, name: textField, item: item};
            });
        }

        let label = this.props.label ? (<label>{this.props.label}</label>) : (<span/>);

        let error = this.props.error;
        if (error) {
            error = typeof error !== "object" ? error : error.status + " " + error.statusText + ": " + error.data;
        }

        return (
            <div className="zone-combo">
                {label}
                <ComboField
                    key={new Date().getUTCMilliseconds()}
                    busy={this.props.busy}
                    disabled={this.props.disabled}
                    fieldRowId={this.props.zoneId}
                    valueField={'id'}
                    textField={'name'}
                    fieldOptions={values}
                    fieldValue={this.props.value}
                    fieldName="zone"
                    fieldException={error}
                    options={{
                        open: this.props.open
                    }}
                    comboFilterType={this.props.comboFilterType}
                    onUpdateField={this.zoneUpdateValue}
                    onToggle={(toggle) => {
                        if (values && values.length > 0) {
                            this.props.onOpenMenu(toggle, this.props.zoneId);
                        }

                        if (toggle && (!this.props.values || this.props.values.length < 1)) {
                            const filter = this.getFilter(this.props.searchText, this.props.searchMethod);
                            this.props.onSearch(true, this.props.zoneId);
                            this.props.onFilter(this.props.url, filter, this.props.zoneId);
                        }
                    }}/>
            </div>
        );
    },
    zoneUpdateValue(id, fieldName, value, attType, rawValue) {
        this.props.onChange(this.props.zoneId, value, rawValue.item);
    },
    searching: false
});

module.exports = ZoneField;
