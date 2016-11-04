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
const {Button, Glyphicon, Alert} = require('react-bootstrap');

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
    renderLegend() {
        if (this.props.element && this.props.element.availableStyles) {
            let i = this.props.element.availableStyles.findIndex((item) => item.name === this.props.element.style);
            if (i >= 0) {
                let style = this.props.element.availableStyles[i];
                let legendUrl = style.legendURL && style.legendURL[0];
            }
        }
    },
    renderError() {
        if (this.props.element && this.props.element.capabilities && this.props.element && this.props.element.capabilities.error) {
            return <Alert bsStyle="danger">There was an error getting layer's style list</Alert>;
        }
    },
    render() {
        return (<form ref="style">
            <Select
                    allowCreate={true}
                    key="styles-dropdown"
                    options={[{label: "Default Style", value: ""}].concat((this.props.element.availableStyles && this.props.element.availableStyles || []).map((item) => {
                        return {label: item.title || item.name, value: item.name};
                    }))}
                    value={this.props.element.style || ""}
                    onChange={(selected) => {
                        this.updateEntry("style", {target: {value: (selected && selected.value) || ""}});
                    }}
                    />
                <br />
                {this.renderLegend()}
                {this.renderError()}
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
