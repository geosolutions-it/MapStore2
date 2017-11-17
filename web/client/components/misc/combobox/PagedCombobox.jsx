/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const Combobox = require('react-widgets').Combobox;
const {Glyphicon, Tooltip} = require('react-bootstrap');
const LocaleUtils = require('../../../utils/LocaleUtils');
const OverlayTrigger = require('../OverlayTrigger');
const AutocompleteListItem = require('../../data/query/AutocompleteListItem');

/**
 * Combobox with remote autocomplete functionality.
 * @memberof components.query
 * @class
 * @prop {bool} [disabled] if the combobox should be disabled
 * @prop {string} [label] the label of the combobox
 * @prop {bool} [paginated] if true it displays the pagination if there is more than one page
 * @prop {string} [textField] the key used for the labes corresponding to filterField.options[x].label
 * @prop {string} [valueField] the key used for the values corresponding to filterField.options[x].value
 *
 */
class PagedCombobox extends React.Component {
    // sorted alphabetically
    static propTypes = {
        busy: PropTypes.bool,
        data: PropTypes.array,
        disabled: PropTypes.bool,
        dropUp: PropTypes.bool,
        itemComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        label: PropTypes.string,
        loading: PropTypes.bool,
        filter: PropTypes.string,
        messages: PropTypes.object,
        onChange: PropTypes.func,
        onFocus: PropTypes.func,
        onSelect: PropTypes.func,
        onToggle: PropTypes.func,
        open: PropTypes.bool,
        pagination: PropTypes.object,
        nextPageIcon: PropTypes.string,
        prevPageIcon: PropTypes.string,
        selectedValue: PropTypes.string,
        textField: PropTypes.string,
        tooltip: PropTypes.object,
        valueField: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        dropUp: false,
        itemComponent: AutocompleteListItem,
        loading: false,
        label: null,
        filter: "",
        pagination: {
            paginated: true,
            firstPage: false,
            lastPage: false,
            loadPrevPage: () => {},
            loadNextPage: () => {}
        },
        nextPageIcon: "chevron-right",
        prevPageIcon: "chevron-left",
        onFocus: () => {},
        onToggle: () => {},
        onChange: () => {},
        onSelect: () => {},
        textField: "label",
        tooltip: {
            customizedTooltip: undefined,
            enabled: false,
            id: "",
            message: undefined,
            overlayTriggerKey: "",
            placement: "top"
        },
        valueField: "value"
    };

    renderWithTooltip = (field) => {
        if (this.props.tooltip.customizedTooltip) {
            const CustomTooltip = this.props.tooltip.customizedTooltip;
            return (<CustomTooltip>
                { field }
            </CustomTooltip>);
        }
        const tooltip = (<Tooltip id={this.props.tooltip.id}>
            {this.props.tooltip.message}</Tooltip>);
        return (<OverlayTrigger key={this.props.tooltip.overlayTriggerKey} placement={this.props.tooltip.placement} overlay={tooltip}>
            { field }
        </OverlayTrigger>);
    };

    renderPagination = () => {
        const firstPage = this.props.pagination.firstPage;
        const lastPage = this.props.pagination.lastPage;
        return (
            <div className="autocomplete-toolbar">
                { !firstPage &&
                    <Glyphicon className={this.props.prevPageIcon} glyph={this.props.prevPageIcon} onClick={() => this.props.pagination.loadPrevPage() }/>
                }
                { !lastPage &&
                    <Glyphicon className={this.props.nextPageIcon} glyph={this.props.nextPageIcon} onClick={() => this.props.pagination.loadNextPage()}/>
                }
            </div>
        );
    };
    renderField = () => {
        const messages = {
            emptyList: LocaleUtils.getMessageById(this.context.messages, "queryform.attributefilter.autocomplete.emptyList"),
            open: LocaleUtils.getMessageById(this.context.messages, "queryform.attributefilter.autocomplete.open"),
            emptyFilter: LocaleUtils.getMessageById(this.context.messages, "queryform.attributefilter.autocomplete.emptyFilter")
        };
        let options = [];
        if (this.props.data && this.props.data.length > 0) {
            options = this.props.data.map(d => d);
        }

        if (this.props.pagination && this.props.pagination.paginated && options.length > 0) {
            options.push({ [this.props.textField]: '', [this.props.valueField]: '', disabled: true, pagination: this.renderPagination() });
        }
        const data = this.props.loading ? [] : options;
        const field = (<Combobox
            dropUp={this.props.dropUp}
            busy={this.props.busy}
            data={data}
            disabled={this.props.disabled}
            itemComponent={(other) => <this.props.itemComponent textField={this.props.textField} valueField={this.props.valueField} {...other}/>}
            messages={this.props.messages || messages}
            open={this.props.open}
            filter={this.props.filter}
            onChange={(val) => this.props.onChange(val)}
            onFocus={() => this.props.onFocus(this.props.data)}
            onSelect={(v) => this.props.onSelect(v)}
            onToggle={() => this.props.onToggle()}
            textField={this.props.textField}
            valueField={this.props.valueField}
            value={this.props.selectedValue}
            />);
        return this.props.tooltip && this.props.tooltip.enabled ? this.renderWithTooltip(field) : field;
    }
    render() {
        let label = this.props.label ? (<label>{this.props.label}</label>) : (<span/>); // TODO change "the else case" value with null ?
        return (
            <div className="autocompleteField">
                {label}
                {this.renderField()}
            </div>);
    }
}

module.exports = PagedCombobox;
