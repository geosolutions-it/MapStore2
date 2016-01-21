/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {isFunction} = require('lodash');

var VisibilityCheck = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        propertiesChangeHandler: React.PropTypes.func,
        style: React.PropTypes.object,
        checkType: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func])
    },
    getDefaultProps() {
        return {
            style: {marginRight: "2px"},
            checkType: "checkbox"
        };
    },
    render() {
        return (<input style={this.props.style}
            data-position={this.props.node.storeIndex}
            type={isFunction(this.props.checkType) ? this.props.checkType(this.props.node) : this.props.checkType}
            checked={this.props.node.visibility ? "checked" : ""}
            onChange={this.changeVisibility} />);
    },
    changeVisibility() {
        this.props.propertiesChangeHandler(this.props.node.id, {visibility: !this.props.node.visibility});
    }
});

module.exports = VisibilityCheck;
