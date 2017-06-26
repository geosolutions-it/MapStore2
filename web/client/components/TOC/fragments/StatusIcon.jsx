var PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Glyphicon} = require('react-bootstrap');

class StatusIcon extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        onClick: PropTypes.func
    };

    static inheritedPropTypes = ['node', 'expanded'];

    static defaultProps = {
        node: null,
        onClick: () => {}
    };

    render() {
        let expanded = this.props.node.expanded !== undefined ? this.props.node.expanded : true;
        return (
            <Glyphicon style={{marginRight: "8px"}} glyph={expanded ? "folder-open" : "folder-close"} />
        );
    }
}

module.exports = StatusIcon;
