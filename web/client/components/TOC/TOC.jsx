/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const dndTree = require('./enhancers/dndTree');
require('./css/toc.css');

class TOC extends React.Component {
    static propTypes = {
        filter: PropTypes.func,
        nodes: PropTypes.array,
        id: PropTypes.string,
        onSort: PropTypes.func,
        onError: PropTypes.func,
        setDndState: PropTypes.func
    };

    static defaultProps = {
        filter() {return true; },
        nodes: [],
        id: 'mapstore-layers',
        onSort: null,
        setDndState: () => {}
    };

    render() {
        var content = [];
        var filteredNodes = this.props.nodes.filter(this.props.filter);
        if (this.props.children) {
            let i = 0;
            content = filteredNodes.map((node) => React.cloneElement(this.props.children, {
                node: node,
                parentNodeId: 'root',
                onSort: this.props.onSort,
                onError: this.props.onError,
                sortIndex: node.hide || node.dummy ? i : i++,
                key: node.name || node.id || 'default',
                isDraggable: !!this.props.onSort && !(node.nodes && node.name === 'Default'),
                setDndState: this.props.setDndState
            }));
        }
        if (this.props.onSort) {
            return (
                <div id={this.props.id} className="mapstore-layers-container">
                    {content}
                </div>
            );
        }
        return <div id={this.props.id} className="mapstore-layers-container">{content}</div>;
    }
}

module.exports = dndTree(TOC);
