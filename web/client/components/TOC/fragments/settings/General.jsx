/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
const {Input} = require('react-bootstrap');

/**
 * General Settings form for layer
 */
var General = React.createClass({
    propTypes: {
        updateSettings: React.PropTypes.func,
        element: React.PropTypes.object
    },
    render() {
        return (<form ref="settings">
                <Input label="title"
                    value={this.props.element.title}
                    key="title"
                    type="text"
                    onChange={this.updateEntry.bind(null, "title")}
                />
                <Input label="name"
                    value={this.props.element.name}
                    key="name"
                    type="text"
                    disabled
                    onChange={this.updateEntry.bind(null, "name")}
                />
            </form>);
    },
    updateEntry(key, event) {
        let value = event.target.value;
        this.props.updateSettings({[key]: value});
    }
});

module.exports = General;
