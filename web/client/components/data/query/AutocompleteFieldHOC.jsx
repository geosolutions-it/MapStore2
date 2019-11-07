/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


const PropTypes = require('prop-types');
const React = require('react');
const assign = require('object-assign');
const AutocompleteListItem = require('./AutocompleteListItem');
const PagedCombobox = require('../../misc/combobox/PagedCombobox');
const {isLikeOrIlike} = require('../../../utils/FilterUtils');
const HTML = require('../../../components/I18N/HTML');

class AutocompleteFieldHOC extends React.Component {
    static propTypes = {
        disabled: PropTypes.bool,
        filterField: PropTypes.object,
        label: PropTypes.string,
        itemComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        maxFeaturesWPS: PropTypes.number,
        onUpdateField: PropTypes.func,
        pagination: PropTypes.object,
        textField: PropTypes.string,
        tooltip: PropTypes.object,
        toggleMenu: PropTypes.func,
        valueField: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        label: null,
        onUpdateField: () => {},
        pagination: {
            paginated: true,
            nextPageIcon: "chevron-right",
            prevPageIcon: "chevron-left"
        },
        itemComponent: AutocompleteListItem,
        toggleMenu: () => {},
        filterField: {
            fieldOptions: {}
        }
    };

    getOptions = () => {
        return this.props.filterField &&
        this.props.filterField.options &&
        this.props.filterField.options[this.props.filterField.attribute] &&
        this.props.filterField.options[this.props.filterField.attribute].map(o => {
            return { value: o, label: o };
        });
    };

    getPagination = (options) => {
        if (!this.props.filterField.options) {
            return {};
        }

        const numberOfPages = Math.ceil(this.props.filterField.fieldOptions.valuesCount / this.props.maxFeaturesWPS);
        const firstPage = this.props.filterField.fieldOptions.currentPage === 1 || !this.props.filterField.fieldOptions.currentPage;
        const lastPage = this.props.filterField.fieldOptions.currentPage === numberOfPages || !this.props.filterField.fieldOptions.currentPage;
        return assign({}, this.props.pagination, {
            paginated: options.length !== 0 && !(firstPage && options.length === 1),
            firstPage,
            lastPage,
            loadPrevPage: () => this.props.onUpdateField(this.props.filterField.rowId, "value", this.props.filterField.value, "string", {currentPage: this.props.filterField.fieldOptions.currentPage - 1, delayDebounce: 0}),
            loadNextPage: () => this.props.onUpdateField(this.props.filterField.rowId, "value", this.props.filterField.value, "string", {currentPage: this.props.filterField.fieldOptions.currentPage + 1, delayDebounce: 0})
        });
    };

    getTooltip = () => {
        return assign({}, this.props.tooltip, {
            enabled: isLikeOrIlike(this.props.filterField.operator),
            id: "autocompleteField-tooltip" + this.props.filterField && this.props.filterField.rowId,
            message: (<HTML msgId="queryform.attributefilter.tooltipTextField"/>),
            overlayTriggerKey: "autocompleteField-overlay" + this.props.filterField && this.props.filterField.rowId,
            placement: "top"
        });
    };
    renderField = () => {
        let selectedValue;
        // CHECK this.props.filterField.value AS ""
        if (this.props.filterField && this.props.filterField.value && this.props.filterField.value !== "*") {
            selectedValue = {
                'value': this.props.filterField.value,
                'label': this.props.filterField.value
            };
        }
        let options = this.getOptions() ? this.getOptions().slice(0) : [];

        return (<PagedCombobox
            busy={this.props.filterField.loading}
            data={this.props.filterField.loading ? [] : options}
            disabled={this.props.filterField.operator === "isNull"}
            itemComponent={this.props.itemComponent}
            open={this.props.filterField.openAutocompleteMenu}
            onChange={(value) => this.handleChange(value)}
            onFocus={() => this.handleFocus(options)}
            onSelect={() => this.handleSelect()}
            onToggle={() => this.handleToggle(options)}
            pagination={this.getPagination(options)}
            selectedValue={selectedValue && selectedValue.value}
            tooltip={this.getTooltip()}
        />);
    }
    render() {
        let label = this.props.label ? (<label>{this.props.label}</label>) : (<span/>);
        return (
            <div className="autocompleteField">
                {label}
                {this.renderField()}
            </div>);
    }

    // called before onChange
    handleSelect = () => {
        this.selected = true;
    };

    handleChange = (input) => {
        if (this.selected) {
            this.selected = false;
            if (input && input.value !== "") {
                this.props.onUpdateField(this.props.filterField.rowId, "value", input.value, "string", {currentPage: 1, selected: "selected", delayDebounce: 0});
            }
        } else {
            this.props.onUpdateField(this.props.filterField.rowId, "value", typeof input === "string" ? input : input.value, "string", {currentPage: 1, delayDebounce: 1000});
        }
    };

    // called before onToggle
    handleFocus = (options) => {
        this.loadWithoutfilter(options);
    };

    handleToggle = () => {
        this.props.toggleMenu(this.props.filterField.rowId, !this.props.filterField.openAutocompleteMenu);
    };

    loadWithoutfilter = (options) => {
        if (options.length === 0 && !this.props.filterField.value) {
            this.props.onUpdateField(this.props.filterField.rowId, "value", "", "string", {currentPage: 1, delayDebounce: 0});
        }
    };
}

module.exports = AutocompleteFieldHOC;
