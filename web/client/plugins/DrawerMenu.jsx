/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');

const Message = require('./locale/Message');

const {toggleControl, setControlProperty} = require('../actions/controls');

const {Button, Glyphicon} = require('react-bootstrap');

const Section = require('./drawer/Section');

const {partialRight} = require('lodash');

const Menu = connect((state) => ({
    show: state.controls.drawer && state.controls.drawer.enabled,
    activeKey: state.controls.drawer && state.controls.drawer.menu
}), {
    onToggle: toggleControl.bind(null, 'drawer', null),
    onChoose: partialRight(setControlProperty.bind(null, 'drawer', 'menu'), true)
})(require('./drawer/Menu'));

require('./drawer/drawer.css');

const DrawerMenu = React.createClass({
    propTypes: {
        items: React.PropTypes.array,
        active: React.PropTypes.string,
        toggleMenu: React.PropTypes.func,
        id: React.PropTypes.string
    },
    contextTypes: {
        messages: React.PropTypes.object,
        router: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            id: "mapstore-drawermenu",
            items: [],
            toggleMenu: () => {}
        };
    },
    renderItems() {
        return this.props.items.map((tool, index) => {
            const Plugin = tool.panel || tool.plugin;
            return (<Section key={tool.name} renderInModal={tool.renderInModal || false} eventKey={(index + 1) + ""} header={<Message msgId={tool.title} />}>
                <Plugin
                    isPanel={true}
                    {...tool.cfg}
                    items={tool.items || []}
                    groupStyle={{style: {
                        marginBottom: "0px",
                        cursor: "pointer"
                    }}}
                    />
            </Section>);
        });
    },
    render() {
        return (
            <div id={this.props.id}>
                <Button id="drawer-menu-button" key="menu-button" className="square-button" onClick={this.props.toggleMenu}><Glyphicon glyph="menu-hamburger"/></Button>
                <Menu title={<Message msgId="menu" />} alignment="left">
                    {this.renderItems()}
                </Menu>
            </div>
        );
    }
});

module.exports = {
    DrawerMenuPlugin: connect((state) => ({
        active: state.controls && state.controls.drawer && state.controls.drawer.active
    }), {
        toggleMenu: toggleControl.bind(null, 'drawer', null)
    })(DrawerMenu),
    reducers: {}
};
