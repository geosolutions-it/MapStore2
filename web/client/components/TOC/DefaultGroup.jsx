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
        propertiesChangeHandler: PropTypes.func,
        groupVisibilityCheckbox: PropTypes.bool,
        visibilityCheckType: PropTypes.string,
        currentLocale: PropTypes.string,
        selectedNodes: PropTypes.array,
        onSelect: PropTypes.func,
        titleTooltip: PropTypes.bool
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
        selectedNodes: [],
        onSelect: () => {},
        titleTooltip: false
    };

    renderVisibility = (error) => {
        return this.props.groupVisibilityCheckbox && !error ?
            (<VisibilityCheck
                node={this.props.node}
                key="visibility"
                checkType={this.props.visibilityCheckType}
                propertiesChangeHandler={this.props.propertiesChangeHandler}/>)
            :
            (<LayersTool key="loadingerror"
                glyph="exclamation-mark text-danger"
                tooltip="toc.loadingerror"
                className="toc-error"/>);
    }

    render() {
        let {children, onToggle, ...other } = this.props;
        const selected = this.props.selectedNodes.filter((s) => s === this.props.node.id).length > 0 ? ' selected' : '';
        const error = this.props.node.loadingError ? ' group-error' : '';
        const grab = other.isDraggable ? <LayersTool key="grabTool" tooltip="toc.grabGroupIcon" className="toc-grab" ref="target" glyph="menu-hamburger"/> : <span className="toc-layer-tool toc-grab"/>;

        return this.props.node.showComponent ? (
            <Node className={"toc-default-group toc-group-" + this.props.level + selected + error} sortableStyle={this.props.sortableStyle} style={this.props.style} type="group" {...other}>
                <div className="toc-default-group-head">
                    {grab}
                    {this.renderVisibility(error)}
                    <GroupTitle tooltip={this.props.titleTooltip} node={this.props.node} currentLocale={this.props.currentLocale} onClick={this.props.onToggle} onSelect={this.props.onSelect}/>
                </div>
                <GroupChildren level={this.props.level + 1} onSort={this.props.onSort} position="collapsible">
                    {this.props.children}
                </GroupChildren>
            </Node>
        ) : null;
    }
}

module.exports = DefaultGroup;
