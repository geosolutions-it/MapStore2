/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
// const Message = require('../../../I18N/Message');
const Select = require('react-select');
const {Button, Glyphicon} = require('react-bootstrap');

/**
 * General Settings form for layer
 */
const WMSStyle = React.createClass({
    propTypes: {
        retrieveLayerData: React.PropTypes.func,
        updateSettings: React.PropTypes.func,
        element: React.PropTypes.object,
        groups: React.PropTypes.array
    },
    getDefaultProps() {
        return {
            element: {},
            retrieveLayerData: () => {},
            updateSettings: () => {}
        };
    },
    render() {
        return (<form ref="style">
            <Select
                    key="styles-dropdown"
                    options={[{label: "Default Style", value: ""}].concat((this.props.element.availableStyles && this.props.element.availableStyles || []).map((item) => {
                        return {label: item.title || item.name, value: item.name};
                    }))}
                    value={this.props.element.style || ""}
                    onChange={(selected) => {
                        this.updateEntry("style", {target: {value: selected.value || ""}});
                    }}
                    />
                <br />
                <Button bsStyle="primary" style={{"float": "right"}} onClick={() => this.props.retrieveLayerData(this.props.element)}><Glyphicon glyph="refresh" />Refresh Styles List</Button>
                <br />
            </form>);
    },
    updateEntry(key, event) {
        let value = event.target.value;
        this.props.updateSettings({[key]: value});
    }
});

module.exports = WMSStyle;
