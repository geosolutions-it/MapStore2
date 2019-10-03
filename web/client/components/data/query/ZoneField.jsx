const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {isEqual} = require('lodash');

const ComboField = require('./ComboField');

const FilterUtils = require('../../../utils/FilterUtils');

class ZoneField extends React.Component {
    static propTypes = {
        zoneId: PropTypes.number,
        url: PropTypes.string,
        typeName: PropTypes.string,
        wfs: PropTypes.string,
        busy: PropTypes.bool,
        values: PropTypes.array,
        value: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.number,
            PropTypes.string,
            PropTypes.array
        ]),
        label: PropTypes.string,
        searchText: PropTypes.string,
        searchMethod: PropTypes.string,
        searchAttribute: PropTypes.string,
        sort: PropTypes.object,
        error: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.string
        ]),
        comboFilter: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.string,
            PropTypes.func
        ]),
        groupBy: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func
        ]),
        multivalue: PropTypes.bool,
        open: PropTypes.bool,
        disabled: PropTypes.bool,
        dependsOn: PropTypes.object,
        valueField: PropTypes.string,
        textField: PropTypes.string,
        onSearch: PropTypes.func,
        onFilter: PropTypes.func,
        onChange: PropTypes.func,
        onSelect: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        open: false,
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
        comboFilter: "contains",
        multivalue: true,
        groupBy: null,
        onSearch: () => {},
        onFilter: () => {},
        // onOpenMenu: () => {},
        onChange: () => {},
        onSelect: () => {}
    };

    state = { open: false};

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.values && !isEqual(this.props.values, nextProps.values) && nextProps.values.length > 0) {
            this.setState({open: true});
        }
    }

    getFilter = (searchText = "*", operator = "=") => {
        let filterObj = {
            filterFields: [{
                attribute: this.props.searchAttribute,
                operator: operator,
                value: searchText,
                type: "list"
            }]
        };

        if (this.props.dependsOn) {
            filterObj.groupFields = [
                {
                    id: 1,
                    logic: "AND",
                    index: 0
                }
            ];

            filterObj.filterFields[0].groupId = 1;

            if (this.props.multivalue) {
                filterObj.groupFields.push({
                    id: 2,
                    logic: "OR",
                    groupId: 1,
                    index: 1
                });

                if (this.props.dependsOn.value instanceof Array) {
                    this.props.dependsOn.value.forEach((val) => {
                        filterObj.filterFields.push({
                            attribute: this.props.dependsOn.field,
                            operator: this.props.dependsOn.operator || "=",
                            value: val,
                            groupId: 2,
                            type: "list"
                        });
                    });
                } else {
                    filterObj.filterFields.push({
                        attribute: this.props.dependsOn.field,
                        operator: this.props.dependsOn.operator || "=",
                        value: this.props.dependsOn.value,
                        groupId: 2,
                        type: "list"
                    });
                }
            } else {
                filterObj.filterFields.push({
                    attribute: this.props.dependsOn.field,
                    operator: this.props.dependsOn.operator || "=",
                    value: this.props.dependsOn.value,
                    groupId: 1,
                    type: "list"
                });
            }
        }

        const filter = FilterUtils.toOGCFilter(this.props.typeName, filterObj, this.props.wfs, this.props.sort || {
            sortBy: this.props.searchAttribute,
            sortOrder: "ASC"
        });

        return filter;
    };

    render() {
        this.values = [];
        if (this.props.values && this.props.values.length > 0) {
            this.values = this.props.values.map((feature) => {

                let valueField = feature;
                this.props.valueField.split('.').forEach(part => {
                    valueField = valueField ? valueField[part] : null;
                });

                let textField = feature;
                this.props.textField.split('.').forEach(part => {
                    textField = textField ? textField[part] : null;
                });

                return {id: valueField, name: textField, feature: feature};
            });
        }

        let label = this.props.label ? <label>{this.props.label}</label> : <span/>;

        let error = this.props.error;
        if (error) {
            error = typeof error !== "object" ? error : error.status + " " + error.statusText + ": " + error.data;
        }

        return (
            <div className="zone-combo">
                {label}
                <ComboField
                    key={new Date().getTime()}
                    busy={this.props.busy}
                    disabled={this.props.disabled}
                    fieldRowId={this.props.zoneId}
                    valueField={'id'}
                    textField={'name'}
                    fieldOptions={this.values}
                    fieldValue={this.props.value}
                    fieldName="zone"
                    fieldException={error}
                    options={{
                        defaultOpen: this.state.open
                    }}
                    groupBy={this.props.groupBy ?
                        (option) => option.feature.properties[this.props.groupBy] : () => {} }
                    multivalue={this.props.multivalue}
                    comboFilter={this.props.comboFilter}
                    onSelect={this.props.onSelect}
                    onUpdateField={this.changeZoneValue}
                    onToggle={(toggle) => {
                        if (toggle && (!this.props.values || this.props.values.length < 1)) {
                            const filter = this.getFilter(this.props.searchText, this.props.searchMethod);
                            this.props.onSearch(true, this.props.zoneId);
                            this.props.onFilter(this.props.url, filter, this.props.zoneId);
                        }
                    }}/>
            </div>
        );
    }

    changeZoneValue = (id, fieldName, value) => {
        this.setState({open: false});
        let val;
        if (this.props.multivalue) {
            val = {
                value: value.map((v) => v.id),
                feature: value.map((v) => v.feature)
            };
        } else {
            val = {
                value: [value],
                feature: [this.values.filter((element) => element.id === value)[0].feature]
            };
        }

        this.props.onChange(this.props.zoneId, val);
    };
}

module.exports = ZoneField;
