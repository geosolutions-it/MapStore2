const PropTypes = require('prop-types');
/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

class DefaultLayerOrGroup extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        groupElement: PropTypes.element.isRequired,
        layerElement: PropTypes.element.isRequired
    };

    render() {
        const {groupElement: DefaultGroup, layerElement: DefaultLayer, node, ...other} = this.props;
        if (node.nodes) {
            return React.cloneElement(DefaultGroup, {node, ...other}, <DefaultLayerOrGroup groupElement={DefaultGroup} layerElement={DefaultLayer}/>);
        }
        return React.cloneElement(DefaultLayer, {node, ...other});
    }
}

module.exports = DefaultLayerOrGroup;
