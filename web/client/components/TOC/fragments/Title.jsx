const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
require("./css/toctitle.css");

class Title extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        onClick: PropTypes.func,
        onContextMenu: PropTypes.func
    };

    static inheritedPropTypes = ['node'];

    static defaultProps = {
        onClick: () => {},
        onContextMenu: () => {}
    };

    render() {
        let expanded = this.props.node.expanded !== undefined ? this.props.node.expanded : true;
        return <span className="toc-title" onClick={() => this.props.onClick(this.props.node.id || this.props.node.name, expanded)} onContextMenu={(e) => {e.preventDefault(); this.props.onContextMenu(this.props.node); }}>{this.props.node.title || this.props.node.name}</span>;
    }
}

module.exports = Title;
