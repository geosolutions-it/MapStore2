const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Sortable = require('react-sortable-items');
require('./css/groupchildren.css');

class GroupChildren extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        filter: PropTypes.func,
        onSort: PropTypes.func,
        level: PropTypes.number
    };

    static inheritedPropTypes = ['node', 'filter', 'onSort'];

    static defaultProps = {
        node: null,
        filter: () => true,
        onSort: null,
        level: 1
    };

    render() {
        let content = [];
        if (this.props.children) {
            let nodes = (this.props.node.nodes || [])
                .filter((node) => this.props.filter(node, this.props.node));
            let i = 0;
            content = nodes.map((node) => React.cloneElement(this.props.children, {
                node: node,
                key: node.id,
                sortData: i++,
                level: this.props.level,
                isDraggable: !!this.props.onSort
            }));
        }
        if (this.props.onSort) {
            return (
                <div className="toc-group-children" >
                    <Sortable minDragDistance={5} onSort={this.handleSort}>
                        {content}
                    </Sortable>
                </div>
            );
        }
        return (
            <div className="toc-group-children" >{content}</div>
        );
    }

    handleSort = (reorder) => {
        this.props.onSort(this.props.node.id, reorder);
    };
}

module.exports = GroupChildren;
