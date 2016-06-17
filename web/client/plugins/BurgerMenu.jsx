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

const {DropdownButton, Glyphicon, MenuItem} = require('react-bootstrap');

const {partial} = require('lodash');

const BurgerMenu = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        dispatch: React.PropTypes.func,
        items: React.PropTypes.array,
        title: React.PropTypes.node,
        onItemClick: React.PropTypes.func,
        controls: React.PropTypes.object,
        mapType: React.PropTypes.string,
        panelStyle: React.PropTypes.object,
        panelClassName: React.PropTypes.string
    },
    contextTypes: {
        messages: React.PropTypes.object,
        router: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            id: "mapstore-burger-menu",
            items: [],
            onItemClick: () => {},
            title: <MenuItem header>Options</MenuItem>,
            controls: [],
            mapType: "leaflet",
            panelStyle: {
                minWidth: "300px",
                right: "52px",
                zIndex: 100,
                position: "absolute",
                overflow: "auto"
            },
            panelClassName: "toolbar-panel"
        };
    },
    renderNavItem(tool) {
        return (<MenuItem key={tool.name + "-menu"} onSelect={(e) => {
            e.preventDefault();
            if (tool.action) {
                this.props.dispatch(partial(tool.action, this.context)());
            } else {
                this.props.onItemClick(tool);
            }
        }}>{tool.icon} {tool.text}</MenuItem>);
    },
    renderPanels() {
        return this.props.items.filter((item) => item.panel).map((panel) => {
            const ToolPanelComponent = panel.panel;
            return (<ToolPanelComponent
                key={panel.name} mapType={this.props.mapType} {...panel.cfg} {...(panel.props || {})}
                items={panel.items || []}/>);
        });
    },
    render() {
        return (<span><DropdownButton className="square-button" id={this.props.id} noCaret pullRight bsStyle="primary" title={<Glyphicon glyph="menu-hamburger" />} >
                {this.props.title}
                {this.props.items.sort((a, b) => a.position - b.position).map(this.renderNavItem)}
            </DropdownButton>
            {this.renderPanels()}
        </span>
            );
    }
});

module.exports = {
    BurgerMenuPlugin: assign(connect((state) => ({
        controls: state.controls
    }))(BurgerMenu), {
        OmniBar: {
            name: "burgermenu",
            position: 2,
            tool: true
        }
    }),
    reducers: {}
};
