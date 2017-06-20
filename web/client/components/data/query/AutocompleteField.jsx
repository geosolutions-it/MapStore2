/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


const React = require('react');
const Combobox = require('react-widgets').Combobox;
const {Glyphicon} = require('react-bootstrap');
require('./css/queryform.less');
const AutocompleteListItem = require('./AutocompleteListItem');
const LocaleUtils = require('../../../utils/LocaleUtils');

/**
 * Combobox with remote autocomplete functionality.
 * @memberof components.query
 * @class
 * @prop {bool} [disabled] if the combobox should be disabled
 * @prop {object} [filterField] the filterField values
 * @prop {string} [label] the label of the combobox
 * @prop {number} [maxFeaturesWPS] the max number of features for any page
 * @prop {function} [onUpdateField] updated the filterfield values in the state
 * @prop {bool} [paginated] if true it displays the pagination if there is more than one page
 * @prop {string} [textField] the key used for the labes corresponding to filterField.options[x].label
 * @prop {function} [toggleMenu] it toggles the combobox menu
 * @prop {string} [valueField] the key used for the values corresponding to filterField.options[x].value
 *
 */
const AutocompleteField = React.createClass({
    propTypes: {
        disabled: React.PropTypes.bool,
        filterField: React.PropTypes.object,
        label: React.PropTypes.string,
        maxFeaturesWPS: React.PropTypes.number,
        nextPage: React.PropTypes.string,
        prevPage: React.PropTypes.string,
        onUpdateField: React.PropTypes.func,
        paginated: React.PropTypes.bool,
        textField: React.PropTypes.string,
        toggleMenu: React.PropTypes.func,
        valueField: React.PropTypes.string
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            label: null,
            nextPage: "chevron-right",
            prevPage: "chevron-left",
            onUpdateField: () => {},
            paginated: true,
            valueField: "value",
            textField: "label",
            toggleMenu: () => {}
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
    renderPagination() {
        const numberOfPages = Math.ceil(this.props.filterField.fieldOptions.valuesCount / this.props.maxFeaturesWPS);
        const firstPage = this.props.filterField.fieldOptions.currentPage === 1 || !this.props.filterField.fieldOptions.currentPage;
        const lastPage = this.props.filterField.fieldOptions.currentPage === numberOfPages || !this.props.filterField.fieldOptions.currentPage;
        return (
            <div className="autocomplete-toolbar">
                { !firstPage &&
                    <Glyphicon className={this.props.prevPage} glyph={this.props.prevPage} onClick={() => this.props.onUpdateField(this.props.filterField.rowId, "value", this.props.filterField.value, "string", {currentPage: this.props.filterField.fieldOptions.currentPage - 1}) }/>
                }
                { !lastPage &&
                    <Glyphicon className={this.props.nextPage} glyph={this.props.nextPage} onClick={() => this.props.onUpdateField(this.props.filterField.rowId, "value", this.props.filterField.value, "string", {currentPage: this.props.filterField.fieldOptions.currentPage + 1})}/>
                }
            </div>
        );
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
        const messages = {
            emptyList: LocaleUtils.getMessageById(this.context.messages, "queryform.attributefilter.autocomplete.emptyList"),
            open: LocaleUtils.getMessageById(this.context.messages, "queryform.attributefilter.autocomplete.open"),
            emptyFilter: LocaleUtils.getMessageById(this.context.messages, "queryform.attributefilter.autocomplete.emptyFilter")
        };
        return (
            <div className="autocompleteField">
                {label}
                <Combobox
                    busy={this.props.filterField.loading}
                    data={this.props.filterField.loading ? [] : options}
                    disabled={this.props.filterField.operator === "isNull"}
                    itemComponent={AutocompleteListItem}
                    messages={messages}
                    open={this.props.filterField.openAutocompleteMenu}
                    onChange={(value) => this.handleChange(value)}
                    onFocus={() => {this.handleFocus(options); }}
                    onSelect={this.handleSelect}
                    onToggle={() => {this.handleToggle(options); }}
                    textField={this.props.textField}
                    valueField={this.props.valueField}
                    value={selectedValue && selectedValue.value}
                    />
            </div>);
    },
    // called before onChange
    handleSelect() {
        this.selected = true;
    },
    handleChange(input) {
        if (this.selected) {
            this.selected = false;
            if (input && input.value !== "") {
                this.props.onUpdateField(this.props.filterField.rowId, "value", input.value, "string", {currentPage: 1, selected: "selected"});
            }
        } else {
            this.props.onUpdateField(this.props.filterField.rowId, "value", input, "string", {currentPage: 1});
        }
    },
    // called before onToggle
    handleFocus(options) {
        this.loadWithoutfilter(options);
    },
    handleToggle() {
        this.props.toggleMenu(this.props.filterField.rowId, !this.props.filterField.openAutocompleteMenu);
    },
    loadWithoutfilter(options) {
        if (options.length === 0 && !this.props.filterField.value) {
            this.props.onUpdateField(this.props.filterField.rowId, "value", "", "string", {currentPage: 1});
        }
    }
});

module.exports = AutocompleteField;
