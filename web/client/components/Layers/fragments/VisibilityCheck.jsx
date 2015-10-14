/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var assign = require('object-assign');

var VisibilityCheck = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        propertiesChangeHandler: React.PropTypes.func
    },
    render() {
        return (<input style={{marginRight: "2px"}}
            data-position={this.props.node.storeIndex} type="checkbox"
            checked={this.props.node.visibility ? "checked" : ""}
            onChange={this.changeLayerVisibility} />);
    },
    changeLayerVisibility(eventObj) {
        let position = parseInt(eventObj.currentTarget.dataset.position, 10);
        var newLayer = assign({}, this.props.node, {visibility: !this.props.node.visibility});
        this.props.propertiesChangeHandler(newLayer, position);
    }
});

module.exports = VisibilityCheck;
