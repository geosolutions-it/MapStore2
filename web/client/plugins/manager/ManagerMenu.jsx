const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');

const assign = require('object-assign');
const { isPageConfigured } = require("../../selectors/plugins");
const {DropdownButton, Glyphicon, MenuItem} = require('react-bootstrap');

const Container = connect(() => ({
    noCaret: true,
    pullRight: true,
    bsStyle: "primary",
    title: <Glyphicon glyph="1-menu-manage"/>
}))(DropdownButton);

const ToolsContainer = require('../containers/ToolsContainer');
const Message = require('../locale/Message');
const { itemSelected } = require('../../actions/manager');
require('../burgermenu/burgermenu.css');

class ManagerMenu extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        dispatch: PropTypes.func,
        role: PropTypes.string,
        entries: PropTypes.array,
        title: PropTypes.node,
        onItemClick: PropTypes.func,
        itemSelected: PropTypes.func,
        controls: PropTypes.object,
        mapType: PropTypes.string,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        enableRulesManager: PropTypes.bool,
        enableImporter: PropTypes.bool,
        enableContextManager: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object,
        router: PropTypes.object
    };

    static defaultProps = {
        id: "mapstore-burger-menu",
        entries: [{
            "msgId": "users.title",
            "glyph": "1-group-mod",
            "path": "/manager/usermanager"
        },
        {
            "msgId": "contextManager.title",
            "glyph": "wrench",
            "path": "/context-manager"
        },
        {
            "msgId": "rulesmanager.menutitle",
            "glyph": "admin-geofence",
            "path": "/rules-manager"
        },
        {
            "msgId": "importer.title",
            "glyph": "upload",
            "path": "/importer"
        }],
        role: "",
        onItemClick: () => {},
        itemSelected: () => {},
        title: <MenuItem header>Manager</MenuItem>,
        controls: [],
        mapType: "leaflet",
        panelStyle: {
            minWidth: "300px",
            right: "52px",
            zIndex: 100,
            position: "absolute",
            overflow: "auto"
        },
        panelClassName: "toolbar-panel",
        enableContextManager: false
    };

    getTools = () => {
        return [{element:
            <span key="burger-menu-title">{this.props.title}</span>},
        ...this.props.entries
            .filter(e => this.props.enableRulesManager || e.path !== "/rules-manager")
            .filter(e => this.props.enableImporter || e.path !== "/importer")
            .filter(e => this.props.enableContextManager || e.path !== "/context-manager")
            .sort((a, b) => a.position - b.position).map((entry) => {
                return {
                    action: (context) => {
                        context.router.history.push(entry.path);
                        this.props.itemSelected(entry.id);
                        return {
                            type: "@@router/LOCATION_CHANGE",
                            payload: {
                                action: context.router.history.action,
                                isFirstRendering: false,
                                location: context.router.history.location
                            }
                        };
                    },
                    text: entry.msgId ? <Message msgId={entry.msgId} /> : entry.text,
                    cfg: {...entry}
                };
            })
        ];
    };

    render() {
        if (this.props.role === "ADMIN") {
            return (
                <ToolsContainer id={this.props.id} className="square-button"
                    container={Container}
                    mapType={this.props.mapType}
                    toolStyle="primary"
                    activeStyle="default"
                    stateSelector="burgermenu"
                    eventSelector="onSelect"
                    tool={MenuItem}
                    tools={this.getTools()}
                    panelStyle={this.props.panelStyle}
                    panelClassName={this.props.panelClassName}
                />);
        }
        return null;
    }
}

const IMPORTER_ID = 'importer';
const RULE_MANAGER_ID = 'rulesmanager';

/**
 * This plugin provides a special Manager dropdown menu, that contains various administration tools
 * @memberof plugins
 * @name ManagerMenu
 * @class
 * @prop {boolean} cfg.enableContextManager: enable context manager menu entry, default `true`
 */
module.exports = {
    ManagerMenuPlugin: assign(connect((state) => ({
        enableRulesManager: isPageConfigured(RULE_MANAGER_ID)(state),
        enableImporter: isPageConfigured(IMPORTER_ID)(state),
        controls: state.controls,
        role: state.security && state.security.user && state.security.user.role
    }), {
        itemSelected
    })(ManagerMenu), {
        OmniBar: {
            name: "managermenu",
            position: 1,
            tool: true,
            priority: 1
        }
    }),
    reducers: {}
};
