const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var Node = require('./Node');
var GroupTitle = require('./fragments/GroupTitle');
var GroupChildren = require('./fragments/GroupChildren');
const VisibilityCheck = require('./fragments/VisibilityCheck');
const {Glyphicon} = require('react-bootstrap');
const GroupSettingsModal = require('./fragments/GroupSettingsModal');

class DefaultGroup extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        style: PropTypes.object,
        settings: PropTypes.object,
        sortableStyle: PropTypes.object,
        onToggle: PropTypes.func,
        level: PropTypes.number,
        onSort: PropTypes.func,
        propertiesChangeHandler: PropTypes.func,
        groupVisibilityCheckbox: PropTypes.bool,
        visibilityCheckType: PropTypes.string,
        onSettings: PropTypes.func,
        updateSettings: PropTypes.func,
        updateNode: PropTypes.func,
        hideSettings: PropTypes.func,
        currentLocale: PropTypes.string
    };

    static defaultProps = {
        node: {},
        onToggle: () => {},
        settings: {},
        style: {
            marginBottom: "16px",
            cursor: "pointer"
        },
        sortableStyle: {},
        propertiesChangeHandler: () => {},
        groupVisibilityCheckbox: false,
        visibilityCheckType: "glyph",
        level: 1,
        onSettings: () => {},
        updateSettings: () => {},
        updateNode: () => {},
        hideSettings: () => {},
        currentLocale: 'en-US'
    };

    renderModal() {
        return this.props.settings.expanded && this.props.settings.node === this.props.node.id ? (
            <GroupSettingsModal
                updateNode={this.props.updateNode}
                updateSettings={this.props.updateSettings}
                hideSettings={this.props.hideSettings}
                settings={this.props.settings}
                element={this.props.node}/>
            ) : null;
    }

    render() {
        let {children, onToggle, ...other } = this.props;
        return (
            <Node className={"toc-default-group toc-group-" + this.props.level} sortableStyle={this.props.sortableStyle} style={this.props.style} type="group" {...other}>
                { this.props.groupVisibilityCheckbox &&
                  <VisibilityCheck
                            key="visibility"
                            checkType={this.props.visibilityCheckType}
                            propertiesChangeHandler={this.props.propertiesChangeHandler}/>}
                <Glyphicon className=" text-primary" glyph="cog" onClick={() => this.props.onSettings(this.props.node.id, "groups", {})}/>
                {this.renderModal()}
                <GroupTitle currentLocale={this.props.currentLocale} onClick={this.props.onToggle}/>
                <GroupChildren level={this.props.level + 1} onSort={this.props.onSort} position="collapsible">
                    {this.props.children}
                </GroupChildren>
            </Node>
        );
    }
}

module.exports = DefaultGroup;
