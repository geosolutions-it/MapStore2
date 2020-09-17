/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Node = require('./Node');
const PropTypes = require('prop-types');
const draggableComponent = require('./enhancers/draggableComponent');
const GroupTitle = require('./fragments/GroupTitle');
const GroupChildren = require('./fragments/GroupChildren');
const VisibilityCheck = require('./fragments/VisibilityCheck');
const LayersTool = require('./fragments/LayersTool');

class DefaultGroup extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        style: PropTypes.object,
        sortableStyle: PropTypes.object,
        onToggle: PropTypes.func,
        level: PropTypes.number,
        onSort: PropTypes.func,
        onError: PropTypes.func,
        propertiesChangeHandler: PropTypes.func,
        groupVisibilityCheckbox: PropTypes.bool,
        visibilityCheckType: PropTypes.string,
        currentLocale: PropTypes.string,
        selectedNodes: PropTypes.array,
        onSelect: PropTypes.func,
        titleTooltip: PropTypes.bool,
        tooltipOptions: PropTypes.object,
        setDndState: PropTypes.func,
        connectDragSource: PropTypes.func,
        connectDragPreview: PropTypes.func,
        connectDropTarget: PropTypes.func,
        isDraggable: PropTypes.bool,
        isDragging: PropTypes.bool,
        isOver: PropTypes.bool
    };

    static defaultProps = {
        node: {},
        onToggle: () => {},
        style: {
            marginBottom: "16px",
            cursor: "pointer"
        },
        sortableStyle: {},
        propertiesChangeHandler: () => {},
        groupVisibilityCheckbox: false,
        visibilityCheckType: "glyph",
        level: 1,
        currentLocale: 'en-US',
        joinStr: ' - ',
        selectedNodes: [],
        onSelect: () => {},
        titleTooltip: false,
        connectDragPreview: (x) => x,
        connectDragSource: (x) => x,
        connectDropTarget: (x) => x,
        isDraggable: false,
        isDragging: false,
        isOver: false
    };

    renderVisibility = (error) => {
        return this.props.groupVisibilityCheckbox && !error ?
            (<VisibilityCheck
                node={this.props.node}
                key="visibility"
                tooltip="toc.toggleGroupVisibility"
                checkType={this.props.visibilityCheckType}
                propertiesChangeHandler={this.props.propertiesChangeHandler}/>)
            :
            (<LayersTool key="loadingerror"
                glyph="exclamation-mark text-danger"
                tooltip="toc.loadingerror"
                className="toc-error"/>);
    }

    render() {
        let {children, onToggle, connectDragPreview, connectDragSource, connectDropTarget, ...other } = this.props;
        const selected = this.props.selectedNodes.filter((s) => s === this.props.node.id).length > 0 ? ' selected' : '';
        const error = this.props.node.loadingError ? ' group-error' : '';
        const grab = other.isDraggable ? <LayersTool key="grabTool" tooltip="toc.grabGroupIcon" className="toc-grab" ref="target" glyph="menu-hamburger"/> : <span className="toc-layer-tool toc-grab"/>;
        const groupHead = (
            <div className="toc-default-group-head">
                {grab}
                {this.renderVisibility(error)}
                <GroupTitle
                    tooltipOptions={this.props.tooltipOptions}
                    tooltip={this.props.titleTooltip}
                    node={this.props.node}
                    currentLocale={this.props.currentLocale}
                    onClick={this.props.onToggle}
                    onSelect={this.props.onSelect}
                />
            </div>
        );
        const groupChildren = (
            <GroupChildren
                level={this.props.level + 1}
                onSort={this.props.onSort}
                onError={this.props.onError}
                setDndState={this.props.setDndState}
                position="collapsible">
                {this.props.children}
            </GroupChildren>
        );
        if (this.props.node.showComponent && !this.props.node.hide) {
            return (
                <Node className={(this.props.isDragging || this.props.node.placeholder ? "is-placeholder " : "") + "toc-default-group toc-group-" + this.props.level + selected + error} sortableStyle={this.props.sortableStyle} style={this.props.style} type="group" {...other}>
                    {connectDragPreview(connectDropTarget(this.props.isDraggable ? connectDragSource(groupHead) : groupHead))}
                    {this.props.isDragging || this.props.node.placeholder ? null : groupChildren}
                </Node>
            );
        }
        return null;
    }
}

module.exports = draggableComponent('LayerOrGroup', DefaultGroup);
