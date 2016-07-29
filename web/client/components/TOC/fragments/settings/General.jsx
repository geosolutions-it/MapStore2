/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
const {Input} = require('react-bootstrap');
const Message = require('../../../I18N/Message');
const {SimpleSelect} = require('react-selectize');
require('react-selectize/themes/index.css');

/**
 * General Settings form for layer
 */
const General = React.createClass({
    propTypes: {
        updateSettings: React.PropTypes.func,
        element: React.PropTypes.object,
        groups: React.PropTypes.array
    },
    getDefaultProps() {
        return {
            element: {},
            updateSettings: () => {}
        };
    },
    render() {
        return (<form ref="settings">
                <Input label={<Message msgId="layerProperties.title" />}
                    value={this.props.element.title}
                    key="title"
                    type="text"
                    onChange={this.updateEntry.bind(null, "title")}
                />
            <Input label={<Message msgId="layerProperties.name" />}
                    value={this.props.element.name}
                    key="name"
                    type="text"
                    disabled
                    onChange={this.updateEntry.bind(null, "name")}
                />
            <label key="group-label" className="control-label"><Message msgId="layerProperties.group" /></label>
            <SimpleSelect
                    key="group-dropdown"
                    options={
                        ((this.props.groups && this.props.groups.map((g) => g.name)) || (this.props.element && this.props.element.group) || []).map(function(item) {
                            return {label: item, value: item};
                        })
                    }
                    defaultValue={{label: this.props.element && this.props.element.group || "Default", value: this.props.element && this.props.element.group || "Default" }}
                    placeholder={this.props.element && this.props.element.group || "Default"}
                    onChange={(value) => {
                        this.updateEntry("group", {target: {value: value || "Default"}});
                    }}
                    theme = "bootstrap3"
                    createFromSearch={function(options, search) {
                        // only create an option from search if the length of the search string is > 0 and
                        // it does no match the label property of an existing option
                        if (search.length === 0 || (options.map(function(option) {
                            return option.label;
                        })).indexOf(search) > -1) {
                            return null;
                        }
                        return {label: search, value: search};
                    }}

                    onValueChange={function(item) {
                        // here, we add the selected item to the options array, the "new-option"
                        // property, added to items created by the "create-from-search" function above,
                        // helps us ensure that the item doesn't already exist in the options array
                        if (!!item && !!item.newOption) {
                            this.options.unshift({label: item.label, value: item.value});
                        }
                        this.onChange(item ? item.value : null);
                    }}/>
            </form>);
    },
    updateEntry(key, event) {
        let value = event.target.value;
        this.props.updateSettings({[key]: value});
    }
});

module.exports = General;
