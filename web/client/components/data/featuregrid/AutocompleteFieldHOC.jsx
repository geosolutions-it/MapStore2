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
const AutocompleteListItem = require('../query/AutocompleteListItem');
const PagedCombobox = require('../../misc/PagedCombobox');
const {isLikeOrIlike} = require('../../../utils/FilterUtils');
const HTML = require('../../../components/I18N/HTML');

class AutocompleteFieldHOC extends React.Component {
    static propTypes = {
        disabled: PropTypes.bool,
        autocompleteProps: PropTypes.object,
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
        onUpdateField: () => {},
        itemComponent: AutocompleteListItem,
        toggleMenu: () => {}
    };

    getOptions = () => {
        return this.props.autocompleteProps &&
        this.props.autocompleteProps.options &&
        this.props.autocompleteProps.options[this.props.autocompleteProps.attribute] &&
        this.props.autocompleteProps.options[this.props.autocompleteProps.attribute].map(o => {
            return { value: o, label: o };
        });
    };

    getPagination = (options) => {
        const numberOfPages = Math.ceil(this.props.autocompleteProps.fieldOptions.valuesCount / this.props.maxFeaturesWPS);
        const firstPage = this.props.autocompleteProps.fieldOptions.currentPage === 1 || !this.props.autocompleteProps.fieldOptions.currentPage;
        const lastPage = this.props.autocompleteProps.fieldOptions.currentPage === numberOfPages || !this.props.autocompleteProps.fieldOptions.currentPage;
        return assign({}, this.props.pagination, {
            paginated: options.length !== 1,
            firstPage,
            lastPage,
            loadPrevPage: () => this.props.onUpdateField(this.props.autocompleteProps.rowId, "value", this.props.autocompleteProps.value, "string", {currentPage: this.props.autocompleteProps.fieldOptions.currentPage - 1, delayDebounce: 0}),
            loadNextPage: () => this.props.onUpdateField(this.props.autocompleteProps.rowId, "value", this.props.autocompleteProps.value, "string", {currentPage: this.props.autocompleteProps.fieldOptions.currentPage + 1, delayDebounce: 0})
        });
    };

    getTooltip = () => {
        return assign({}, this.props.tooltip, {
            enabled: isLikeOrIlike(this.props.autocompleteProps.operator),
            id: "autocompleteField-tooltip" + this.props.autocompleteProps && this.props.autocompleteProps.rowId,
            message: (<HTML msgId="queryform.attributefilter.tooltipTextField"/>),
            overlayTriggerKey: "autocompleteField-overlay" + this.props.autocompleteProps && this.props.autocompleteProps.rowId,
            placement: "top"
        });
    };
    renderField = () => {
        let selectedValue;
        // CHECK this.props.autocompleteProps.value AS ""
        if (this.props.autocompleteProps && this.props.autocompleteProps.value && this.props.autocompleteProps.value !== "*") {
            selectedValue = {
                'value': this.props.autocompleteProps.value,
                'label': this.props.autocompleteProps.value
            };
        }
        let options = this.getOptions() ? this.getOptions().slice(0) : [];

        return (<PagedCombobox
            busy={this.props.autocompleteProps.loading}
            data={this.props.autocompleteProps.loading ? [] : options}
            disabled={this.props.autocompleteProps.operator === "isNull"}
            itemComponent={this.props.itemComponent}
            open={this.props.autocompleteProps.openAutocompleteMenu}
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
        return (
            <div className="autocompleteField">
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
                this.props.onUpdateField(this.props.autocompleteProps.rowId, "value", input.value, "string", {currentPage: 1, selected: "selected", delayDebounce: 0});
            }
        } else {
            this.props.onUpdateField(this.props.autocompleteProps.rowId, "value", input, "string", {currentPage: 1, delayDebounce: 1000});
        }
    };

    // called before onToggle
    handleFocus = (options) => {
        this.loadWithoutfilter(options);
    };

    handleToggle = () => {
        this.props.toggleMenu(this.props.autocompleteProps.rowId, !this.props.autocompleteProps.openAutocompleteMenu);
    };

    loadWithoutfilter = (options) => {
        if (options.length === 0 && !this.props.autocompleteProps.value) {
            this.props.onUpdateField(this.props.autocompleteProps.rowId, "value", "", "string", {currentPage: 1, delayDebounce: 0});
        }
    };
}

module.exports = AutocompleteFieldHOC;
