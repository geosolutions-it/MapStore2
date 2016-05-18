/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');

const {action} = require('../actions/my');
const My = React.createClass({
    propTypes: {
        action: React.PropTypes.func,
        style: React.PropTypes.object,
        content: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            style: {},
            content: "Hello!",
            action: () => {}
        };
    },
    render() {
        return (<span className="my" onClick={this.action} style={this.props.style}>{this.props.content}</span>);
    },
    action() {
        this.props.action(this.props.content);
    }
});


const MyPlugin = connect(() => ({}), {
    action
})(My);

module.exports = {
    MyPlugin,
    reducers: {my: require('../reducers/my')}
};
